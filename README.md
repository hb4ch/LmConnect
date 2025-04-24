# LMConnect - Cross-platform LLM Chat Application

![Application Screenshot](./screenshot.png) *(screenshot placeholder)*

A desktop application that provides a unified interface for interacting with multiple large language model APIs including OpenAI, Claude, Google Gemini, and DeepSeek.

## Features

- **Multi-provider support**: Switch between different LLM APIs
- **API key management**: Securely store and manage API keys
- **Persistent chat history**: All conversations are saved locally
- **Modern UI**: Clean, responsive interface
- **Cross-platform**: Works on Windows and Linux

## Installation

### Prerequisites
- Node.js v18+
- npm/yarn

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/hb4ch/LMConnect.git
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

1. Launch the application:
   ```bash
   npm start
   ```
2. In the sidebar:
   - Select your preferred LLM provider
   - Enter and save your API key
3. Start chatting in the main window

## Building

To create distributable packages:

```bash
npm run dist
```

This will generate:
- Linux: AppImage in `build/` directory
- Windows: Installer in `build/windows/`

## Configuration

The application automatically creates a SQLite database in your system's application data directory to store:
- API keys
- Chat history

## Supported Providers

- OpenAI (GPT models)
- Anthropic (Claude)
- Google (Gemini)
- DeepSeek

## License

MIT License - See [LICENSE](./LICENSE) file

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
