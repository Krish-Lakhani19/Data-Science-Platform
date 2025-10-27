# 🧠 DataScience Universe Platform v3.0

[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-macOS%20%7C%20Windows%20%7C%20Linux-lightgrey.svg)](https://github.com)

**A comprehensive, all-in-one Data Science and Machine Learning platform with everything you need for complete data analysis.**

---

## 🌟 Features

### Core Capabilities
- 📤 **Data Upload & Management** - CSV, Excel, JSON support
- 📊 **Exploratory Data Analysis** - Complete statistical analysis with interactive visualizations
- 🤖 **Classical ML Models** - Linear Regression, Random Forest, Gradient Boosting, SVM
- 🧠 **Deep Learning** - Neural Networks, LSTM, CNN architectures
- 📈 **Time Series Analysis** - Forecasting with trend decomposition
- 📝 **Natural Language Processing** - Sentiment analysis and text mining
- 🎯 **Clustering** - K-Means, DBSCAN, Hierarchical clustering
- ⚡ **AutoML** - Automated model selection and training
- 💡 **Comprehensive Insights** - Model comparison and performance metrics

### Advanced Features
- Real-time training progress tracking
- Feature importance visualization
- Confusion matrices for classification
- Correlation heatmaps
- Interactive charts (Line, Bar, Scatter, Area, Radar, Pie)
- Model export and reporting
- Responsive design for all devices

---

## 🚀 Quick Start (macOS)

### Prerequisites
- macOS 10.15 or higher
- Node.js 16.x or higher
- npm 8.x or higher
- VS Code (recommended)

### Installation

1. **Clone or Create Project Directory**
```bash
mkdir datascience-universe
cd datascience-universe
```

2. **Initialize React Project**
```bash
npx create-react-app .
```

3. **Install Dependencies**
```bash
npm install recharts papaparse lucide-react
```

4. **Replace App.js**
- Copy the platform code to `src/App.js`

5. **Start Development Server**
```bash
npm start
```

6. **Open Browser**
- Navigate to `http://localhost:3000`

---

## 📋 Detailed Setup Instructions

### Step 1: Install Node.js (if not installed)

**Option A: Using Homebrew (Recommended)**
```bash
# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node
```

**Option B: Download from Official Website**
- Visit [nodejs.org](https://nodejs.org/)
- Download macOS installer
- Run installer and follow instructions

**Verify Installation:**
```bash
node --version  # Should show v16.x.x or higher
npm --version   # Should show 8.x.x or higher
```

### Step 2: Install VS Code (if not installed)

1. Download from [code.visualstudio.com](https://code.visualstudio.com/)
2. Drag to Applications folder
3. Open VS Code

**Recommended Extensions:**
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- ESLint
- Auto Rename Tag

### Step 3: Create Project

**Open Terminal in VS Code** (Press `` Ctrl + ` ``)

```bash
# Navigate to desired location
cd ~/Documents

# Create project directory
mkdir datascience-universe
cd datascience-universe

# Create React app
npx create-react-app .

# Wait for installation to complete (2-5 minutes)
```

### Step 4: Install Required Packages

```bash
# Install all dependencies
npm install recharts papaparse lucide-react

# Verify installation
npm list recharts papaparse lucide-react
```

### Step 5: Add Platform Code

1. **Open VS Code:**
```bash
code .
```

2. **Navigate to `src/App.js`**
3. **Delete existing content**
4. **Paste the DataScience Platform code**
5. **Save file** (Cmd + S)

### Step 6: Start the Application

```bash
npm start
```

The app will automatically open at `http://localhost:3000`

---

## 📁 Project Structure

```
Data-Science-Platform/
├── datascience-universe/
├── node_modules/          # Dependencies
├── public/
│   ├── index.html         # HTML template
│   └── favicon.ico        # App icon
├── src/
│   ├── App.js            # Main platform code (REPLACE THIS)
│   ├── index.js          # Entry point
│   └── index.css         # Global styles
├── package.json          # Project configuration
├── package-lock.json     # Dependency lock file
└── README.md            # This file
```

---

## 🎯 Usage Guide

### 1. Upload Data
- Click "Upload Data" tab
- Drag & drop CSV file or click to browse
- Supported formats: CSV, Excel (.xlsx, .xls), JSON
- Data is automatically analyzed upon upload

### 2. Explore Data
- View automatic statistics for all columns
- Generate interactive visualizations
- Analyze correlation matrices
- Identify patterns and outliers

### 3. Train Models

**Classical ML:**
1. Go to "ML Models" tab
2. Select target column (what to predict)
3. Select feature columns (predictors)
4. Click "Train" on any model
5. View results in "Insights" tab

**Deep Learning:**
1. Go to "Deep Learning" tab
2. Select target and features
3. Choose architecture (NN, LSTM, CNN)
4. Train model
5. Compare performance

**AutoML:**
1. Go to "AutoML" tab
2. Configure target and features
3. Click "Start AutoML"
4. System trains 5 models automatically
5. Best model is selected

### 4. Specialized Analysis

**Time Series:**
- Select date and value columns
- Run forecasting analysis
- View predictions with confidence intervals

**NLP:**
- Select text column
- Analyze sentiment
- Extract top words and patterns

**Clustering:**
- Select 2+ numeric features
- Choose clustering algorithm
- Visualize clusters

---

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm start
```

### Module Not Found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### React Version Issues
```bash
# Check React version
npm list react

# Update if needed
npm install react@latest react-dom@latest
```

### Build Errors
```bash
# Clear cache
npm cache clean --force

# Reinstall
rm -rf node_modules
npm install
```

---

## 📊 Supported Data Formats

### CSV Files
```csv
feature1,feature2,target
1.0,2.5,10
2.0,3.1,15
3.0,4.2,20
```

---

## 🎨 Customization

### Modify Colors
Edit the `COLORS` array in `src/App.js`:
```javascript
const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', ...];
```

### Add New Models
Add to the models array in the respective tab:
```javascript
{ name: 'Your Model', type: 'yourmodel' }
```

### Adjust Hyperparameters
Modify default values in state:
```javascript
const [hyperparameters, setHyperparameters] = useState({
  learningRate: 0.01,
  epochs: 100,
  // Add more...
});
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/)
- Charts powered by [Recharts](https://recharts.org/)
- CSV parsing by [PapaParse](https://www.papaparse.com/)
- Icons from [Lucide React](https://lucide.dev/)

---

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Email: krishlakhani46767@gmail.com
- Documentation: [docs.datascienceuniverse.com](https://docs.datascienceuniverse.com)

---

## 🗺️ Roadmap

- [ ] Real-time collaboration
- [ ] Cloud deployment integration
- [ ] Model serving API
- [ ] Advanced NLP features
- [ ] Computer vision capabilities
- [ ] Custom model architecture builder
- [ ] Dataset versioning
- [ ] A/B testing framework

---

**Made with ❤️ for Data Scientists**

*Star ⭐ this repo if you find it useful!*
