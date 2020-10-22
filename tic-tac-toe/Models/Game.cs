using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace tic_tac_toe
{
    public class Game
    {
        public int Id {get; set;}
        public string GameName { get; set; }
        public string CurrentStatement { get; set; }
        public string CurrentPlayer { get; set; }
        public string XConnectionId { get; set; }
        public string OConnectionId { get; set; }
    }
}
