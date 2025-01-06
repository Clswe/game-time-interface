import { Component, OnInit, OnDestroy } from '@angular/core';
import { SocketService } from '../services/socket.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, OnDestroy {
  playerData: any;
  socketConnected: boolean = false;


  players: any[] = [];
  currentPlayer: any;
  currentTurn: number = 1;
  eliminatedPlayers: any[] = [];
  message: string = '';
  timer: number = 0;

  constructor(private socketService: SocketService) {}

  ngOnInit(): void {

    this.socketService.on('player-update', (data: any) => {
      console.log('Recebido evento player-update:', data);
      this.playerData = data;
      this.updatePlayersList(data);
    });

    this.socketConnected = this.socketService.isConnected();
  }

  ngOnDestroy(): void {
    this.socketService.disconnect();
  }

  updatePlayersList(playerData: any): void {
    const existingPlayerIndex = this.players.findIndex(player => player.socketId === playerData.socketId);
    if (existingPlayerIndex !== -1) {

      this.players[existingPlayerIndex] = playerData;
    } else {

      this.players.push(playerData);
    }
  }

  startGame(): void {
    console.log('Jogo iniciado');
    this.message = 'Jogo iniciado!';
  }

  onPlayerClick(playerId: number): void {
    console.log(`Jogador ${playerId} fez uma jogada`);
    this.message = `Jogador ${playerId} fez uma jogada!`;
  }

  endGame(): void {
    console.log('Jogo finalizado');
    this.message = 'Jogo finalizado!';
  }
}
