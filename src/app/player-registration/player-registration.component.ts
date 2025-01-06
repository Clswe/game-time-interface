import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-player-registration',
  templateUrl: './player-registration.component.html',
  styleUrls: ['./player-registration.component.css'],
})
export class PlayerRegistrationComponent {
  playerName: string = '';
  private readonly apiUrl: string = 'http://localhost:5000/api/players';

  constructor(private http: HttpClient, private router: Router) {}

  registerPlayer(): void {
    const playerName = this.getTrimmedPlayerName();

    if (!this.isPlayerNameValid(playerName)) {
      return;
    }

    this.submitRegistration(playerName);
  }

  private getTrimmedPlayerName(): string {
    return this.playerName.trim();
  }

  private isPlayerNameValid(playerName: string): boolean {
    if (!playerName) {
      this.showErrorMessage('O nome do jogador é obrigatório!');
      return false;
    }
    return true;
  }

  private submitRegistration(playerName: string): void {
    this.http.post(`${this.apiUrl}/register`, { name: playerName }).subscribe({
      next: () => this.onRegistrationSuccess(),
      error: (err) => this.onRegistrationError(err),
    });
  }

  private onRegistrationSuccess(): void {
    alert('Jogador registrado com sucesso!');
    this.resetForm();
    this.navigateToGamePage();
  }

  private onRegistrationError(err: any): void {
    const errorMessage = this.getErrorMessage(err);
    this.showErrorMessage(errorMessage);
  }

  private showErrorMessage(message: string): void {
    alert(message);
    console.error(message);
  }

  private getErrorMessage(err: any): string {
    return err.error?.message || err.message || 'Erro desconhecido ao registrar jogador.';
  }

  private resetForm(): void {
    this.playerName = '';
  }

  private navigateToGamePage(): void {
    this.router.navigate(['/game']);
  }
}
