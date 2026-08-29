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

O **LogQR** é uma solução completa para controle de frequência em salas de aula, eventos e instituições de ensino. O sistema substitui as chamadas tradicionais em papel e formulários suscetíveis a fraudes por um fluxo moderno: o aluno gera seu **QR Code dinâmico diário** diretamente pelo seu celular, e o professor/colaborador realiza a leitura instantânea pela câmera traseira nativa, registrando presenças e faltas em tempo real no banco de dados.

---

## ✨ Principais Funcionalidades da Versão 1.0.0

### 🛡️ 1. QR Code Diário com Proteção Anti-Fraude
- **Geração Sob Demanda:** O estudante clica em *"⚡ Gerar QR Code de Hoje"* para carregar seu código.
- **Validação Criptográfica HMAC SHA-256:** O QR Code é assinado com chave secreta do servidor e vinculado à data do dia (`YYYY-MM-DD`). 
- **Prints e Fotos Rejeitados:** Códigos de dias anteriores são automaticamente invalidados pelo leitor, impedindo fraudes.
- **Alto Contraste:** Renderização otimizada para leitura instantânea por qualquer câmera de smartphone.

### 👨‍💼 2. Painel do Administrador (`/admin`)
- **Dashboard Central:** Métricas em tempo real de turmas, alunos e chamadas realizadas.
- **Design Híbrido Responsivo:** Tabelas completas no Desktop e **Cards Nativos no Mobile** (sem necessidade de rolagem lateral).
- **Gestão de Alunos (`/admin/students`):** Cadastro, edição, visualização de perfis e alteração de cargos em tempo real com sincronização Postgres.
- **Gestão de Turmas (`/admin/courses`):** Criação de cursos e gerenciamento de matrículas dinâmico com Server Actions.
- **Gestão de Equipe (`/admin/staff`):** Controle de colaboradores, professores e administradores.
- **Relatórios de Frequência (`/admin/reports`):** Métricas consolidadas com taxa percentual de presença (`%`), total de aulas e contagem de presenças.

### 📱 3. Módulo do Colaborador / Professor (`/scanner`)
- **Seleção de Turma:** Cards modernos com botão de ação rápida *"Abrir Câmera e Escanear"*.
- **Abertura Direta da Câmera Traseira:** Inicialização instantânea sem menus intermediários de escolha.
- **Sessão Automática:** Detecção e criação automática da chamada do dia.
- **Card de Confirmação em Tempo Real:** Overlay visual exibindo o nome do aluno identificado, horário do check-in e feedback sonoro agradável.

### 🎓 4. Portal do Aluno (`/student`)
- **Carteirinha Digital:** Dados cadastrais, curso atual e placar com **Presenças**, **Faltas** e **Taxa de Frequência (%)**.
- **Gerador de QR Code do Dia:** Botão interativo para exibir e ocultar o QR Code diário.
- **Histórico Aula por Aula:** Lista cronológica detalhada de todas as aulas com selo visual 🟢 **PRESENTE** (com horário do check-in) ou 🔴 **FALTA** (caso o aluno não tenha comparecido).

### 📲 5. Aplicativo Mobile Nativo (Android APK)
- Encapsulado com **Capacitor.js** gerando o executável oficial **`LogQR.apk`**.
- Tela de abertura (Splash Screen) animada em estilo cyber com scanner laser.
- Sincronização em tempo real com a versão web sem necessidade de reinstalação para atualizações frontend.

---

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologia |
|---|---|
| **Frontend & Backend** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack, Server Actions) |
| **Linguagem** | [TypeScript](https://www.typescriptlang.org/) |
| **Banco de Dados** | [PostgreSQL (Supabase)](https://supabase.com/) |
| **ORM** | [Prisma](https://www.prisma.io/) (com Connection Pooling) |
| **Autenticação** | [Supabase Auth](https://supabase.com/auth) (Cookies SSR + Trigger PL/pgSQL) |
| **Leitor de Câmera** | [html5-qrcode](https://github.com/mebjas/html5-qrcode) (Câmera Traseira Direta) |
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
Crie um arquivo `.env` na raiz do projeto:
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

## 📱 Como Gerar o Aplicativo Android (LogQR.apk)

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
   📂 `android/app/build/outputs/apk/debug/LogQR.apk`

---

## 👤 Autoria

Projeto idealizado, planejado e desenvolvido por:

**Matheus Vasconcelos**  
🔗 [GitHub: @matheusvsr8](https://github.com/matheusvsr8)

---

<div align="center">
  <sub>Desenvolvido com dedicação e paixão por tecnologia • LogQR © 2026</sub>
</div>
