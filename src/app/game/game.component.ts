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

  constructor(private socketService: SocketService) {}

  ngOnInit(): void {
    // Inscrever-se no evento player-update para receber atualizações em tempo real
    this.socketService.on('player-update', (data: any) => {
      console.log('Recebido evento player-update:', data);
      this.playerData = data;  // Atualiza a informação do jogador
    });

    // Verificar se o socket está conectado
    this.socketConnected = this.socketService.isConnected();
  }

  ngOnDestroy(): void {
    // Caso precise desconectar ou limpar eventos quando o componente for destruído
    this.socketService.disconnect();
  }

  // Exemplo de como emitir um evento para o servidor
  sendPlayerUpdate(): void {
    const playerData = {
      socketId: 'abc123',
      name: 'Player1',
      totalTime: 100,
      isActive: true
    };

    this.socketService.emitPlayerUpdate(playerData);
  }

  // Método para emitir evento manualmente
  emitCustomEvent(): void {
    const eventData = { message: 'Custom event data' };
    this.socketService.emit('custom-event', eventData);
  }

  // Método para verificar a conexão do socket
  checkConnection(): void {
    this.socketConnected = this.socketService.isConnected();
  }
}
