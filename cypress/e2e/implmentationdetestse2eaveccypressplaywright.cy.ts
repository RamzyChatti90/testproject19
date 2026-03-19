// cypress/e2e/login.cy.ts

describe('Page de connexion', () => {
  beforeEach(() => {
    // Visite la page de connexion avant chaque test
    // Assurez-vous que votre 'baseUrl' est configuré dans cypress.config.ts (ex: baseUrl: 'http://localhost:3000')
    cy.visit('/login');
  });

  it('devrait afficher le formulaire de connexion', () => {
    // Vérifie la présence des champs utilisateur, mot de passe et du bouton de connexion
    cy.get('[data-cy="username-input"]').should('be.visible');
    cy.get('[data-cy="password-input"]').should('be.visible');
    cy.get('[data-cy="login-button"]').should('be.visible').and('contain', 'Se connecter');
  });

  it('devrait permettre à un utilisateur de se connecter avec succès', () => {
    // Rempli les champs et clique sur le bouton de connexion
    cy.get('[data-cy="username-input"]').type('utilisateur_test');
    cy.get('[data-cy="password-input"]').type('motdepasse123');
    cy.get('[data-cy="login-button"]').click();

    // Vérifie la redirection vers la page du tableau de bord
    cy.url().should('include', '/dashboard');
    // Vérifie un élément distinctif du tableau de bord
    cy.get('[data-cy="welcome-message"]').should('be.visible').and('contain', 'Bienvenue, utilisateur_test!');
  });

  it('devrait afficher un message d\'erreur pour des identifiants invalides', () => {
    // Tente de se connecter avec des identifiants incorrects
    cy.get('[data-cy="username-input"]').type('utilisateur_invalide');
    cy.get('[data-cy="password-input"]').type('mauvaismotdepasse');
    cy.get('[data-cy="login-button"]').click();

    // Vérifie l'affichage du message d'erreur et que l'URL reste sur la page de connexion
    cy.get('[data-cy="error-message"]').should('be.visible').and('contain', 'Identifiants invalides');
    cy.url().should('include', '/login');
  });

  it('devrait afficher des erreurs de validation pour les champs vides', () => {
    // Clique sur le bouton de connexion sans remplir les champs
    cy.get('[data-cy="login-button"]').click();

    // Vérifie l'affichage des messages d'erreur de validation pour chaque champ
    // (Assumant que votre application affiche ces messages près des champs)
    cy.get('[data-cy="username-error"]').should('be.visible').and('contain', 'Le nom d\'utilisateur est requis');
    cy.get('[data-cy="password-error"]').should('be.visible').and('contain', 'Le mot de passe est requis');
    cy.url().should('include', '/login');
  });
});


// cypress/e2e/dashboard.cy.ts

// Pour une meilleure organisation, la commande 'login' devrait être définie
// dans 'cypress/support/commands.ts' et non directement ici.
// Pour l'exercice, nous la plaçons ici avec sa déclaration TypeScript.

// Définition d'une commande personnalisée 'login'
Cypress.Commands.add('login', (username, password) => {
  cy.visit('/login');
  cy.get('[data-cy="username-input"]').type(username);
  cy.get('[data-cy="password-input"]').type(password);
  cy.get('[data-cy="login-button"]').click();
  cy.url().should('include', '/dashboard');
});

// Déclaration globale pour que TypeScript reconnaisse la nouvelle commande
declare global {
  namespace Cypress {
    interface Chainable {
      login(username: string, password: string): Chainable<Element>;
    }
  }
}


describe('Page d\'accueil / Tableau de bord', () => {
  beforeEach(() => {
    // Se connecte avant chaque test pour s'assurer que l'utilisateur est authentifié
    cy.login('utilisateur_test', 'motdepasse123');
  });

  it('devrait afficher les éléments principaux du tableau de bord', () => {
    // Vérifie les éléments clés après connexion
    cy.get('[data-cy="welcome-message"]').should('be.visible').and('contain', 'Bienvenue, utilisateur_test!');
    cy.get('[data-cy="dashboard-title"]').should('be.visible').and('contain', 'Votre Tableau de Bord');
    cy.get('[data-cy="navigation-menu"]').should('be.visible');
    cy.get('[data-cy="widget-total-users"]').should('be.visible');
    cy.get('[data-cy="widget-recent-activity"]').should('be.visible');
  });

  it('devrait permettre la navigation vers différentes sections depuis le menu', () => {
    // Teste la navigation vers une page "Paramètres"
    cy.get('[data-cy="nav-settings"]').click();
    cy.url().should('include', '/settings');
    cy.get('[data-cy="settings-page-title"]').should('be.visible').and('contain', 'Paramètres');

    // Retourne au tableau de bord
    cy.go('back');
    cy.url().should('include', '/dashboard');

    // Teste la navigation vers une page "Rapports"
    cy.get('[data-cy="nav-reports"]').click();
    cy.url().should('include', '/reports');
    cy.get('[data-cy="reports-page-title"]').should('be.visible').and('contain', 'Aperçu des Rapports');
  });

  it('devrait afficher et interagir avec une liste de données ou un tableau', () => {
    // Vérifie la présence d'un tableau de données
    cy.get('[data-cy="data-table"]').should('be.visible');
    // Vérifie qu'il y a au moins une ligne de données
    cy.get('[data-cy="data-table-row"]').should('have.length.at.least', 1);

    // Interagit avec la première ligne du tableau (ex: la clique pour voir les détails)
    cy.get('[data-cy="data-table-row"]').first().click();
    cy.url().should('include', '/details/'); // Assumant que cela redirige vers une page de détails
    cy.get('[data-cy="detail-view-title"]').should('be.visible');
  });

  it('devrait permettre à l\'utilisateur de se déconnecter', () => {
    cy.get('[data-cy="logout-button"]').click();
    // Vérifie la redirection vers la page de connexion
    cy.url().should('include', '/login');
    // Vérifie la présence du champ utilisateur pour confirmer la déconnexion
    cy.get('[data-cy="username-input"]').should('be.visible');
  });
});