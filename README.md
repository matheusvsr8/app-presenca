# ⚡ LogQR — Sistema Inteligente de Presença & Frequência por QR Code

<div align="center">

![LogQR Logo](https://img.shields.io/badge/LogQR-v1.0.0-00d95f?style=for-the-badge&logo=qrcode&logoColor=black)
![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-PostgreSQL-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Capacitor](https://img.shields.io/badge/Capacitor-Android%20APK-119EFF?style=for-the-badge&logo=capacitor&logoColor=white)

**Controle moderno, rápido e seguro de presença escolar e acadêmica através de QR Codes dinâmicos com proteção anti-fraude diária.**

[🌐 Acessar Projeto em Produção](https://app-presenca-omega.vercel.app) • [📱 Changelog Oficial](changelog/v1.0.0.md)

</div>

---

## 📖 Sobre o Projeto

O **LogQR** é uma solução completa para controle de frequência em salas de aula, eventos e instituições de ensino. O sistema substitui as chamadas tradicionais em papel e formulários suscetíveis a fraudes por um fluxo moderno: o aluno gera seu **QR Code dinâmico diário** diretamente pelo seu celular, e o professor/colaborador realiza a leitura instantânea pela câmera.

---

## ✨ Principais Funcionalidades

### 🛡️ 1. QR Code Diário com Proteção Anti-Fraude
- **Geração Sob Demanda:** O estudante clica em *"Gerar QR Code de Hoje"* para carregar seu código.
- **Validação Criptográfica HMAC SHA-256:** O QR Code é assinado com chave secreta e vinculado à data do dia (`YYYY-MM-DD`). 
- **Prints e Fotos Rejeitados:** Códigos de dias anteriores são automaticamente bloqueados pelo leitor, impedindo que alunos compartilhem prints com colegas faltantes.

### 👨‍💼 2. Painel do Administrador (`/admin`)
- **Gestão de Alunos:** Cadastro, edição, perfil detalhado e gerenciador de cargos com 1 clique (Aluno ⇄ Colaborador ⇄ Administrador).
- **Gestão de Turmas:** Criação de cursos e gerenciador de matrículas dinâmico em tempo real.
- **Gestão de Equipe:** Controle de professores, colaboradores e outros administradores.
- **Relatórios de Frequência:** Visualização detalhada do percentual de presença de cada aluno, histórico de presenças e cálculo automático de faltas.

### 📱 3. Módulo do Colaborador / Professor (`/scanner`)
- **Seleção de Turma:** Escolha rápida da turma para iniciar a aula.
- **Criação de Sessão Automática:** O sistema identifica o dia atual e abre a sessão de aula automaticamente.
- **Leitor Contínuo por Câmera:** Leitura ultra-rápida via `html5-qrcode` com feedback visual imediato via notificações Toast.

### 🎓 4. Portal do Aluno (`/student`)
- **Carteirinha Digital:** Informações da matrícula, turma e contadores de presença e faltas.
- **Visualizador de QR Code:** Exibição clara e de alto contraste em preto e branco para leitura instantânea.

### 📲 5. Aplicativo Mobile Nativo (Android APK)
- Encapsulado com **Capacitor.js** para execução nativa no Android.
- Tela de abertura (Splash Screen) animada em estilo cyber futurista.
- Acesso à câmera integrado e suporte a permissões de hardware.

---

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologia |
|---|---|
| **Frontend & Backend** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack, Server Actions) |
| **Linguagem** | [TypeScript](https://www.typescriptlang.org/) |
| **Banco de Dados** | [PostgreSQL (Supabase)](https://supabase.com/) |
| **ORM** | [Prisma](https://www.prisma.io/) (com Connection Pooling) |
| **Autenticação** | [Supabase Auth](https://supabase.com/auth) (Cookies SSR + Trigger PL/pgSQL) |
| **Leitor de Câmera** | [html5-qrcode](https://github.com/mebjas/html5-qrcode) |
| **Gerador de QR Code** | [qrcode.react](https://github.com/zpao/qrcode.react) |
| **Mobile Wrapper** | [Capacitor](https://capacitorjs.com/) (Android Studio) |
| **Notificações** | [Sonner](https://sonner.emilkowal.ski/) |
| **Ícones** | [Lucide React](https://lucide.dev/) |
| **Estilização** | CSS Modules (Dark Cyber/Neon Design System) |

---

## 🗄️ Modelo do Banco de Dados

```mermaid
erDiagram
    Tenant ||--o{ User : possui
    Tenant ||--o{ Course : possui
    User ||--o{ Enrollment : matriculado
    Course ||--o{ Enrollment : contem
    Course ||--o{ Session : realiza
    Session ||--o{ Attendance : registra
    User ||--o{ Attendance : recebe

    User {
        string id PK
        string name
        string email
        Role role "ADMIN | COLLABORATOR | STUDENT"
        string qrCode
        string tenantId FK
    }

    Course {
        string id PK
        string name
        string tenantId FK
    }

    Session {
        string id PK
        datetime date
        string courseId FK
    }

    Attendance {
        string id PK
        string sessionId FK
        string studentId FK
        datetime createdAt
    }
```

---

## 🚀 Como Executar Localmente

### 1. Pré-requisitos
- [Node.js](https://nodejs.org/) (v18 ou superior)
- Conta no [Supabase](https://supabase.com/) com PostgreSQL

### 2. Clonar o Repositório
```bash
git clone https://github.com/matheusvsr8/app-presenca.git
cd app-presenca
```

### 3. Instalar Dependências
```bash
npm install
```

### 4. Configurar as Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto com as seguintes chaves:
```env
NEXT_PUBLIC_SUPABASE_URL=https://sua-url-supabase.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-supabase
DATABASE_URL=postgresql://postgres.xxx:senha@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.xxx:senha@aws-0-sa-east-1.pooler.supabase.com:5432/postgres
QR_SECRET_KEY=sua_chave_secreta_criptografica_aqui
```

### 5. Executar as Migrações do Banco
```bash
npx prisma generate
npx prisma db push
```

### 6. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
```
Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 📱 Como Gerar o Aplicativo Android (.APK)

1. Sincronize as configurações do Capacitor:
   ```bash
   npx cap sync android
   ```
2. Abra o projeto no **Android Studio**:
   ```bash
   npx cap open android
   ```
3. No menu superior do Android Studio, clique em:
   👉 **`Build` ➔ `Build Bundle(s) / APK(s)` ➔ `Build APK(s)`**
4. O arquivo final estará disponível na pasta:
   📂 `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 👤 Autoria

Projeto idealizado, planejado e desenvolvido por:

**Matheus Vasconcelos**  
🔗 [GitHub: @matheusvsr8](https://github.com/matheusvsr8)

---

<div align="center">
  <sub>Desenvolvido com dedicação e paixão por tecnologia • LogQR © 2026</sub>
</div>
