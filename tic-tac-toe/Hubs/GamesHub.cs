using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks;
using EFDataApp.Models;
using Microsoft.AspNetCore.Server.IIS.Core;
using Microsoft.AspNetCore.SignalR;

namespace tic_tac_toe
{
    public class GamesHub : Hub
    {
        private ApplicationContext db;
        public GamesHub(ApplicationContext context)
        {
            db = context;
        }
        public async Task Create(string gameName, string tags)
        {
            await this.Clients.Caller.SendAsync("SelfCreate", gameName, tags);
            await this.Clients.Others.SendAsync("OthersCreate",gameName, tags);
            Game game = new Game()
            {
                GameName = gameName, 
                CurrentStatement = "", 
                CurrentPlayer = "X" ,
                Tags = tags,
                XConnectionId = this.Context.ConnectionId
            };
            await this.Groups.AddToGroupAsync(this.Context.ConnectionId, gameName);
            await this.Groups.RemoveFromGroupAsync(this.Context.ConnectionId, "All");
            db.Games.Add(game);
            await db.SaveChangesAsync();
            }

        public async Task Join(string gameName, string tags)
        {
            var game = db.Games.ToList().Single(current => current.GameName == gameName);
            game.OConnectionId = this.Context.ConnectionId;
            db.Games.Update(game);
            await db.SaveChangesAsync();
            await this.Clients.Group(gameName).SendAsync("InitXPlayer", gameName, tags);
            await this.Clients.Caller.SendAsync("InitOPlayer", gameName, tags);
            await this.Groups.RemoveFromGroupAsync(this.Context.ConnectionId, "All");
            await this.Groups.AddToGroupAsync(this.Context.ConnectionId, gameName);
            await this.Clients.Group("All").SendAsync("UpdateOther", gameName, tags);
        }

        public async Task Move(string gameName, string player, int x, int y)
        {
            var game = db.Games.ToList().Single(current => current.GameName == gameName);
            if (player == game.CurrentPlayer)
            {
                await this.Clients.Group(gameName).SendAsync("Move", gameName, player, x,y);
                if (game.CurrentPlayer == "X")
                {
                    game.CurrentPlayer = "O";
                }
                else
                {
                    game.CurrentPlayer = "X";
                }
                db.Games.Update(game);
                await db.SaveChangesAsync();
            }
        }

        public async Task GoBack(string winner, string gameName){
            await this.Clients.Group(gameName).SendAsync("GoBack", winner, gameName);
            await this.Clients.Group(gameName).SendAsync("Reload");
            var game = db.Games.ToList().Single(current => current.GameName == gameName);
            db.Games.Remove(game);
            await db.SaveChangesAsync();
        }

        public override async Task OnConnectedAsync()
        {
            await this.Groups.AddToGroupAsync(this.Context.ConnectionId, "All"); 
            await base.OnConnectedAsync();
            await this.Clients.Caller.SendAsync("Init", db.Games.ToList());
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var game = db.Games.ToList().Single(current => current.XConnectionId == this.Context.ConnectionId || current.OConnectionId == this.Context.ConnectionId);
            db.Games.Remove(game);
            await this.Clients.All.SendAsync("DeleteGame", game.GameName);
            await this.Clients.Group(game.GameName).SendAsync("Back", game.GameName);
            await db.SaveChangesAsync();
            await base.OnDisconnectedAsync(exception);
        }

        public async Task Back(string gameName){ 
            var game = db.Games.ToList().Single(current => current.GameName == gameName);
            db.Games.Remove(game);
            await this.Clients.Group(gameName).SendAsync("Back", gameName);
        }
    }
}
