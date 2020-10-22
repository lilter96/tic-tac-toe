using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
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
                CurrentPlayer = "X" 
            };
            await this.Groups.AddToGroupAsync(this.Context.ConnectionId, gameName);
            db.Games.Add(game);
            await db.SaveChangesAsync();
        }

        public async Task Join(string gameName, string tags)
        {
            await this.Clients.Group(gameName).SendAsync("InitXPlayer", gameName, tags);
            await this.Clients.Caller.SendAsync("InitOPlayer", gameName, tags);
            IReadOnlyList<string> players = new List<string>()
                {Clients.Caller.ToString(), Clients.Group(gameName).ToString()};
            await this.Clients.AllExcept(players).SendAsync("UpdateOther", gameName, tags);
        }
    }
}
