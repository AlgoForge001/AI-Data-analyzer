# AI Data Analyzer 🚀

AI Data Analyzer is a powerful, AI-driven data visualization and insights tool. Upload your datasets (CSV or Excel) and ask natural language questions to get instant, interactive charts and summary tables.

![AI Data Analyzer Banner](https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200&h=400)

## ✨ Features

- 📂 **Multi-format Support**: Upload CSV and Excel files effortlessly.
- 💬 **Natural Language Querying**: Just type what you want to see (e.g., "Show me the monthly sales trend").
- 📊 **Intelligent Visualizations**: AI automatically chooses the best chart type (Bar, Line, Scatter, Pie, Heatmap, Box).
- 📋 **Automated Insights**: Generates pivot tables and summary statistics based on your query.
- 🎨 **Premium UI**: Modern, dark-themed dashboard with smooth animations and interactive components.

## 🛠️ Tech Stack

### Frontend
- **React** (Vite)
- **Tailwind CSS** (Styling)
- **Lucide React** (Icons)
- **Plotly.js & Recharts** (Interactive Visualizations)

### Backend
- **FastAPI** (Python Web Framework)
- **Pandas** (Data Manipulation)
- **OpenAI / OpenRouter** (LLM-driven Config Generation)
- **Plotly Python** (Chart Specification)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- OpenRouter API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AI-Data-analyzer
   ```

2. **Frontend Setup**
   ```bash
   npm install
   ```

3. **Backend Setup**
   ```bash
   cd fastApi
   # Create a virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

4. **Environment Variables**
   Create a `.env` file in the `fastApi` directory:
   ```env
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd fastApi
   uvicorn api:app --reload
   ```

2. **Start the Frontend Development Server**
   ```bash
   # In the root directory
   npm run dev
   ```

## 📖 Usage Guide

1. **Upload Data**: Drag and drop or select your CSV/Excel file in the "Data Input" section.
2. **Ask a Question**: Enter your analysis request in the prompt box (e.g., "Analyze the correlation between marketing spend and revenue").
3. **Execute**: Click "Execute Analysis".
4. **Interact**: Explore the generated charts and tables in the results viewport.

---

Built with ❤️ for data analysts and decision makers.
