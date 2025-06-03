<div align="center">

# 🌟 TheraBot 🌟

<img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version"/>
<img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License"/>
<img src="https://img.shields.io/badge/next.js-14.2-black.svg" alt="Next.js"/>
<img src="https://img.shields.io/badge/OpenAI-GPT--4%20Turbo-orange.svg" alt="OpenAI"/>

**An emotionally intelligent AI therapeutic assistant with depth psychology insights**

[Features](#✨-features) • 
[Demo](#🚀-live-demo) • 
[Installation](#💻-installation) • 
[Usage](#🔍-usage) • 
[Configuration](#⚙️-configuration) • 
[Architecture](#🏗️-architecture) • 
[License](#📝-license)

<img src="./public/therabot-screenshot.png" alt="TheraBot Screenshot" width="80%"/>

</div>

## ✨ Features

- **🧠 Emotional Intelligence**: Delivers psychologically insightful, emotionally resonant responses
- **👤 Personalization**: Addresses users by their preferred name for a more intimate experience
- **🔄 Structured Responses**: Detects emotions, suggests coping strategies, and offers follow-up questions
- **🌈 Configurable Depth**: Adjustable response depth, therapeutic style, and emotional resonance
- **🛡️ Privacy-Focused**: No data persistence beyond the session, ensuring user confidentiality

## 🚀 Live Demo

Experience TheraBot in action at [therabot-demo.vercel.app](https://example.com) (placeholder)

## 💻 Installation

```bash
# Clone the repository
git clone https://github.com/Patrickscott999/threa_bot_test.git
cd threa_bot_test

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your API keys

# Start the development server
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000) to see TheraBot in action.

## 🔍 Usage

1. **Sign Up/Login**: Create an account to personalize your experience
2. **Start Chatting**: Share your thoughts and feelings with TheraBot
3. **Customize**: Change the name TheraBot calls you for a more personal experience
4. **Explore Features**: Try different types of conversations to experience the full range of TheraBot's capabilities

## ⚙️ Configuration

TheraBot can be customized through environment variables:

| Variable | Description | Options |
|----------|-------------|--------|
| `NEXT_PUBLIC_RESPONSE_DEPTH` | Depth of responses | `low`, `medium`, `high` |
| `NEXT_PUBLIC_THERAPEUTIC_STYLE` | Style of therapy | `concise`, `balanced`, `detailed` |
| `NEXT_PUBLIC_POETIC_INTENSITY` | Level of poetic language | `subtle`, `moderate`, `transformative` |
| `NEXT_PUBLIC_EMOTIONAL_DEPTH` | Emotional resonance | `gentle`, `deep`, `profound` |
| `OPENAI_MODEL` | OpenAI model to use | `gpt-4-turbo`, `gpt-4`, etc. |
| `OPENAI_MAX_TOKENS` | Maximum response length | Numeric value (e.g., `1024`) |
| `OPENAI_TEMPERATURE` | Response creativity | `0.0` to `1.0` |

## 🏗️ Architecture

```
TheraBot/
├── src/
│   ├── app/            # Next.js app router pages
│   │   ├── api/        # API routes including chat endpoint
│   │   ├── chat/       # Chat interface
│   │   ├── login/      # Authentication pages
│   │   └── signup/     # User registration
│   ├── components/     # React components
│   │   ├── chat/       # Chat UI components
│   │   └── ui/         # Shared UI elements
│   ├── lib/            # Utility libraries
│   │   ├── openai.ts   # OpenAI integration with prompt engineering
│   │   └── supabase/   # Authentication services
│   └── styles/         # Global styling
├── docs/               # Documentation
└── public/             # Static assets
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [OpenAI](https://openai.com) for their powerful API
- [Next.js](https://nextjs.org) for the React framework
- [Tailwind CSS](https://tailwindcss.com) for styling
- [Supabase](https://supabase.io) for authentication

---

<div align="center">
  <p>Created with ❤️ by <a href="https://github.com/Patrickscott999">Patrick Scott</a></p>
  <p>© 2025 TheraBot</p>
</div>
