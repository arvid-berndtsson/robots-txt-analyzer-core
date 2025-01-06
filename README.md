# Robots.txt Analyzer 🤖

A modern web tool for analyzing robots.txt files, built with Qwik and deployed on Cloudflare Pages. Try it out at [robots-txt.arvid.tech](https://robots-txt.arvid.tech)!

## Features

- 🔍 Instant robots.txt analysis
- 📊 Comprehensive scoring system
- 🗺️ Sitemap validation
- 🚫 Security recommendations
- 📱 Mobile-friendly interface
- 💾 Export results as JSON or CSV
- ⚡️ Built with Qwik for optimal performance

## Development

### Prerequisites

- Node.js 16+
- npm or yarn
- A `.env.local` file with:
  ```
  ORIGIN="http://localhost:5173"
  API_KEY="your-api-key"
  ```

### Getting Started

1. Clone the repository
2. Install dependencies:
   ```shell
   npm install
   ```
3. Start the development server:
   ```shell
   npm run dev
   ```
4. Visit [http://localhost:5173](http://localhost:5173)

### Building for Production

```shell
npm run build
```

### Preview Production Build

```shell
npm run preview
```

## Deployment

This project is deployed on Cloudflare Pages. The build configuration is:

- Build command: `npm run build`
- Build output directory: `dist`
- Environment variables:
  - `ORIGIN`: Your production URL
  - `API_KEY`: Your API key for the analyzer

## Project Structure

```
├── src/
│   ├── components/      # Reusable UI components
│   ├── routes/          # Page routes and API endpoints
│   └── utils/          # Utility functions and parsers
├── public/             # Static assets
└── adapters/           # Cloudflare Pages adapter config
```

## Built With

- [Qwik](https://qwik.dev/) - The web framework
- [Cloudflare Pages](https://pages.cloudflare.com/) - Hosting platform
- [Tailwind CSS](https://tailwindcss.com/) - Styling

## Author

Built by [Arvid Berndtsson](https://arvid.tech)

## License

This project is open source and available under the MIT [License](LICENSE).
