import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket!: Socket;
  private playerUpdateSubject = new Subject<any>();  // Sujeito para emitir atualizações do jogador
  playerUpdate$ = this.playerUpdateSubject.asObservable(); // Observable que o componente pode assinar

  constructor() {
    this.initializeSocket();
  }

  /**
   * Inicializa a conexão do WebSocket com o servidor.
   * Define os eventos para conexão, erro, reconexão e desconexão.
   */
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

  /**
   * Método para registrar eventos no socket.
   * @param event - Nome do evento a ser registrado.
   * @param callback - Função de calback a ser chamada quando o evento ocorrer.
   */
  on(event: string, callback: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
      console.log(`Listener adicionado para o evento: ${event}`);
    } else {
      console.error('Erro: Socket não está conectado.');
    }
  }

  /**
   * Gera um evento para o servidor WebSocket com os dados do jogador.
   * @param playerData - Objeto contendo os dados do jogador (socketId, name, totalTime, isActive).
   */
  emitPlayerUpdate(playerData: { socketId: string, name: string, totalTime: number, isActive: boolean }): void {
    if (this.isConnected()) {
      console.log('Emitindo evento player-update com dados:', playerData);
      this.socket.emit('player-update', playerData);
    } else {
      console.error('Erro: Não conectado ao servidor.');
      this.handleDisconnectedState('player-update', playerData);
    }
  }

  /**
   * Gera um evento para o servidor WebSocket.
   * @param event - O nome do evento a ser emitido.
   * @param data - Os dados a serem enviados com o evento.
   */
  emit(event: string, data?: any): void {
    if (this.isConnected()) {
      console.log(`Emitindo evento: ${event} com dados:`, data);
      this.socket.emit(event, data);
    } else {
      console.warn('Tentativa de emitir evento sem conexão com o servidor.');
      this.handleDisconnectedState(event, data);
    }
  }

  /**
   * Verifica se o socket está conectado ao servidor WebSocket.
   * @returns {boolean} Retorna true se estiver conectado, caso contrário, false.
   */
  isConnected(): boolean {
    return this.socket && this.socket.connected;
  }

  /**
   * Método para desinscrever do evento de atualização do jogador.
   * O componente pode se inscrever neste método para receber atualizações do jogador.
   * @returns {Observable<any>} Retorna um Observable que emite dados de atualização do jogador.
   */
  onPlayerUpdate(): Observable<any> {
    return this.playerUpdate$;
  }

  /**
   * Desconecta o socket do servidor WebSocket.
   */
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
