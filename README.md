# MedInfo India

A medical information lookup application for finding detailed pharmaceutical data.

## Project info

Built with Vite, React, TypeScript, and Supabase.

## How can I edit this code?

**Use your preferred IDE**

Clone this repository and make changes locally using your favorite code editor
## 🧠 How It Works

MedInfo uses an LLM-powered chat experience that understands user queries such as:

> "Is Dolo 650 safe for kids?"
> "Substitute for Atorva 10?"
> "What is Azithromycin used for?"

The intelligence layer handles interpretation and response generation without depending on public drug APIs. This makes the system highly flexible and fast to extend.

---

## 🧩 Tech Stack

| Layer              | Technology                   |
| ------------------ | ---------------------------- |
| Framework          | Vite + React 18              |
| Language           | TypeScript                   |
| UI Components      | shadcn/ui + Radix UI         |
| Styling            | Tailwind CSS                 |
| State/Data         | React Query                  |
| Routing            | React Router DOM             |
| Backend (Optional) | Supabase                     |
| AI Layer           | LLM-driven (model-pluggable) |
| Notifications      | Sonner + shadcn Toaster      |
| Charts (future)    | Recharts                     |
| Theming            | next-themes                  |

---


## ⚡️ Development Setup

### 1. Clone the repository

```sh
git clone https://github.com/your-username/medinfo-india.git
cd medinfo-india
```

### 2. Install dependencies

```sh
npm install
```
This project can be deployed to various platforms including Vercel, Netlify, or any static hosting service:

1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting provider

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```
### 4. Run development server

```sh
npm run dev
```

---

## 🧱 Design Principles

* **Conversational over structured**
* **Accessible healthcare knowledge**
* **India-focused medicine context**
* **Modular + maintainable codebase**
* **Future extensibility for:**

  * Prescription analytics
  * Pricing integration
  * Indian pharmacy APIs (Netmeds / 1mg / Apollo / PharmEasy)
  * Offline caching
  * Doctor-side dashboards

---

## 🌐 Deployment

Can be deployed to:

* Vercel
* Netlify
* Supabase Hosting
* Railway
* Render

Build:

```sh
npm run build
npm run preview
```

---

## 📌 Status

> Currently in active development and undergoing enhancements for richer AI medical context and integration with Indian pharmaceutical datasets.

---

## 🎯 Vision

To create a reliable and intelligent conversational interface for medicine understanding in India — making medical information more accessible, contextual, and user-friendly.

---

## 🛡 Disclaimer

MedInfo India is intended for educational and informational purposes only and does not replace professional medical consultation.

---

## 👤 Author

Sidesh
Creator & Developer — MedInfo India

---
