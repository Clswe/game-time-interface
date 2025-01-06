import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket!: Socket;
  private playerUpdateSubject = new Subject<any>();
  playerUpdate$ = this.playerUpdateSubject.asObservable();

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket(): void {
    try {
      this.socket = io('http://localhost:5000', {
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('Conectado ao servidor WebSocket');
      });

      this.socket.on('connect_error', (err) => {
        console.error('Erro de conexão:', err);
        this.handleConnectionError(err);
      });

      this.socket.on('disconnect', () => {
        console.warn('Desconectado do servidor WebSocket');
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log(`Reconectado ao servidor WebSocket, tentativa ${attemptNumber}`);
      });

      this.socket.on('reconnect_failed', () => {
        console.error('Falha ao tentar reconectar ao servidor WebSocket.');
      });

      this.socket.on('player-update', (data) => {
        console.log('Atualização do jogador recebida:', data);
        this.playerUpdateSubject.next(data);
      });

    } catch (error) {
      console.error('Erro ao inicializar o socket:', error);
    }
  }


  on(event: string, callback: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
      console.log(`Listener adicionado para o evento: ${event}`);
    } else {
      console.error('Erro: Socket não está conectado.');
    }
  }

  emitPlayerUpdate(playerData: { socketId: string, name: string, totalTime: number, isActive: boolean }): void {
    if (this.isConnected()) {
      console.log('Emitindo evento player-update com dados:', playerData);
      this.socket.emit('player-update', playerData);
    } else {
      console.error('Erro: Não conectado ao servidor.');
      this.handleDisconnectedState('player-update', playerData);
    }
  }


  emit(event: string, data?: any): void {
    if (this.isConnected()) {
      console.log(`Emitindo evento: ${event} com dados:`, data);
      this.socket.emit(event, data);
    } else {
      console.warn('Tentativa de emitir evento sem conexão com o servidor.');
      this.handleDisconnectedState(event, data);
    }
  }


  isConnected(): boolean {
    return this.socket && this.socket.connected;
  }


  onPlayerUpdate(): Observable<any> {
    return this.playerUpdate$;
  }


  disconnect(): void {
    if (this.isConnected()) {
      this.socket.disconnect();
      console.log('Desconectado do servidor WebSocket');
    } else {
      console.warn('Socket já está desconectado.');
    }
  }

  private handleDisconnectedState(event: string, data?: any) {
    console.warn(`Evento ${event} não foi emitido porque o socket está desconectado.`);
  }

  private handleConnectionError(error: any) {
    console.error('Erro na conexão com o servidor WebSocket:', error);
  }
}
