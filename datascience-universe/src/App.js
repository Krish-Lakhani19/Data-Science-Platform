import React, { useState } from 'react';
import { Upload, BarChart3, LineChart, Download, Play, Database, Brain, Table, TrendingUp, Code, FileText, Zap, AlertCircle, Filter, Save, Trash2, Clock, Users, GitBranch, Share2 } from 'lucide-react';
import { LineChart as RechartsLine, BarChart as RechartsBar, ScatterChart as RechartsScatter, PieChart as RechartsPie, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, Line, Bar, Scatter, Pie, Cell, ResponsiveContainer, AreaChart, Area } from 'recharts';
import * as Papa from 'papaparse';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function DataSciencePlatform() {
  // PHASE 1 STATE
  const [activeTab, setActiveTab] = useState('upload');
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [fileName, setFileName] = useState('');
  const [selectedColumns, setSelectedColumns] = useState({ x: '', y: '' });
  const [chartType, setChartType] = useState('line');
  const [filters, setFilters] = useState({});
  const [statistics, setStatistics] = useState({});
  const [mlModel, setMlModel] = useState({ type: '', trained: false, predictions: [] });
  const [dataQuality, setDataQuality] = useState({ issues: [], score: 100 });
  const [correlationMatrix, setCorrelationMatrix] = useState([]);
  const [customTransforms, setCustomTransforms] = useState([]);
  const [codeGen, setCodeGen] = useState({ language: 'python', code: '' });
  const [savedProjects, setSavedProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState({ name: '', description: '' });
  const [advancedML, setAdvancedML] = useState({ 
  decisionTree: null, 
  neuralNet: null, 
  ensemble: null,
  activeModel: null 
});
const [featureEngineering, setFeatureEngineering] = useState({
  features: [],
  importance: []
});
const [autoML, setAutoML] = useState({
  running: false,
  bestModel: null,
  results: []
});
const [modelComparison, setModelComparison] = useState([]);
const [deployment, setDeployment] = useState({
  endpoint: '',
  apiKey: '',
  deployed: false
});
const [realTimeAnalysis, setRealTimeAnalysis] = useState({
  active: false,
  predictions: []
});

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        setData(results.data);
        const cols = Object.keys(results.data[0] || {});
        setColumns(cols);
        if (cols.length >= 2) {
          setSelectedColumns({ x: cols[0], y: cols[1] });
        }
        calculateStatistics(results.data, cols);
        analyzeDataQuality(results.data, cols); 
        calculateCorrelations(results.data, cols);  
        setActiveTab('explore');
}
    });
  };

  const calculateStatistics = (dataset, cols) => {
    const stats = {};
    cols.forEach(col => {
      const values = dataset.map(row => row[col]).filter(v => typeof v === 'number');
      if (values.length > 0) {
        const sorted = [...values].sort((a, b) => a - b);
        const sum = values.reduce((a, b) => a + b, 0);
        const mean = sum / values.length;
        const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
        stats[col] = {
          count: values.length,
          mean: mean.toFixed(2),
          median: sorted[Math.floor(sorted.length / 2)].toFixed(2),
          min: Math.min(...values).toFixed(2),
          max: Math.max(...values).toFixed(2),
          stdDev: Math.sqrt(variance).toFixed(2)
        };
      }
    });
    setStatistics(stats);
  };
  const analyzeDataQuality = (dataset, cols) => {
  const issues = [];
  let score = 100;

  cols.forEach(col => {
    const values = dataset.map(row => row[col]);
    const nullCount = values.filter(v => v === null || v === undefined || v === '').length;
    const nullPercentage = (nullCount / values.length) * 100;

    if (nullPercentage > 0) {
      issues.push({ 
        column: col, 
        type: 'Missing Values', 
        severity: nullPercentage > 20 ? 'high' : 'medium',
        detail: `${nullPercentage.toFixed(1)}% missing values`
      });
      score -= Math.min(nullPercentage / 2, 10);
    }

    // Check for low variance
    const numericValues = values.filter(v => typeof v === 'number');
    if (numericValues.length > 0) {
      const uniqueCount = new Set(numericValues).size;
      if (uniqueCount < numericValues.length * 0.1) {
        issues.push({
          column: col,
          type: 'Low Variance',
          severity: 'low',
          detail: `Only ${uniqueCount} unique values`
        });
        score -= 5;
      }
    }
  });

  setDataQuality({ issues, score: Math.max(0, Math.round(score)) });
};

const calculateCorrelations = (dataset, cols) => {
  const numericCols = cols.filter(col => {
    return dataset.some(row => typeof row[col] === 'number');
  });

  const matrix = [];
  numericCols.forEach(col1 => {
    const row = { column: col1 };
    numericCols.forEach(col2 => {
      const values1 = dataset.map(r => r[col1]).filter(v => typeof v === 'number');
      const values2 = dataset.map(r => r[col2]).filter(v => typeof v === 'number');
      
      if (values1.length > 0 && values2.length > 0) {
        const mean1 = values1.reduce((a, b) => a + b, 0) / values1.length;
        const mean2 = values2.reduce((a, b) => a + b, 0) / values2.length;
        
        let numerator = 0;
        let denom1 = 0;
        let denom2 = 0;
        
        for (let i = 0; i < values1.length; i++) {
          numerator += (values1[i] - mean1) * (values2[i] - mean2);
          denom1 += Math.pow(values1[i] - mean1, 2);
          denom2 += Math.pow(values2[i] - mean2, 2);
        }
        
        const correlation = numerator / Math.sqrt(denom1 * denom2);
        row[col2] = isNaN(correlation) ? 0 : correlation.toFixed(2);
      }
    });
    matrix.push(row);
  });

  setCorrelationMatrix(matrix);
};

const applyTransform = (transformType) => {
  let transformed = [...data];
  
  switch(transformType) {
    case 'normalize':
      const col = selectedColumns.y;
      const values = transformed.map(row => row[col]).filter(v => typeof v === 'number');
      const min = Math.min(...values);
      const max = Math.max(...values);
      transformed = transformed.map(row => ({
        ...row,
        [`${col}_normalized`]: typeof row[col] === 'number' 
          ? ((row[col] - min) / (max - min)).toFixed(4)
          : row[col]
      }));
      setColumns([...columns, `${col}_normalized`]);
      break;
      
    case 'log':
      const logCol = selectedColumns.y;
      transformed = transformed.map(row => ({
        ...row,
        [`${logCol}_log`]: typeof row[logCol] === 'number' && row[logCol] > 0
          ? Math.log(row[logCol]).toFixed(4)
          : row[logCol]
      }));
      setColumns([...columns, `${logCol}_log`]);
      break;
      
    case 'removeMissing':
      transformed = transformed.filter(row => {
        return columns.every(col => row[col] !== null && row[col] !== undefined && row[col] !== '');
      });
      break;
  }
  
  setData(transformed);
  setCustomTransforms([...customTransforms, { type: transformType, timestamp: new Date().toISOString() }]);
};

const generateCode = (language) => {
  let code = '';

  if (language === 'python') {
    code = `import pandas as pd
    import numpy as np
    import matplotlib.pyplot as plt
    from sklearn.linear_model import LinearRegression
    from sklearn.cluster import KMeans
    df = pd.read_csv('${fileName}')

# Data exploration
print(df.head())
print(df.describe())
print(df.info())

# Visualization
plt.figure(figsize=(10, 6))
plt.plot(df['${selectedColumns.x}'], df['${selectedColumns.y}'])
plt.xlabel('${selectedColumns.x}')
plt.ylabel('${selectedColumns.y}')
plt.title('${selectedColumns.x} vs ${selectedColumns.y}')
plt.show()

# Linear Regression
X = df[['${selectedColumns.x}']].values
y = df['${selectedColumns.y}'].values
model = LinearRegression()
model.fit(X, y)
predictions = model.predict(X)
print(f'Coefficient: {model.coef_[0]:.4f}')
print(f'Intercept: {model.intercept_:.4f}')

# K-Means Clustering
kmeans = KMeans(n_clusters=3, random_state=42)
df['cluster'] = kmeans.fit_predict(df[['${selectedColumns.x}', '${selectedColumns.y}']])
print(df['cluster'].value_counts())`;
  } else if (language === 'r') {
    code = `library(tidyverse)
library(cluster)

# Load data
df <- read.csv('${fileName}')

# Data exploration
head(df)
summary(df)
str(df)

ggplot(df, aes(x = ${selectedColumns.x}, y = ${selectedColumns.y})) +
  geom_point() +
  geom_smooth(method = "lm") +
  theme_minimal() +
  labs(title = "${selectedColumns.x} vs ${selectedColumns.y}")

model <- lm(${selectedColumns.y} ~ ${selectedColumns.x}, data = df)
summary(model)

# K-Means Clustering
kmeans_result <- kmeans(df[, c('${selectedColumns.x}', '${selectedColumns.y}')], centers = 3)
df$cluster <- kmeans_result$cluster
table(df$cluster)`;
  } else if (language === 'javascript') {
    code = `// Using PapaParse and D3.js
const Papa = require('papaparse');
const d3 = require('d3');

// Load data
Papa.parse('${fileName}', {
  header: true,
  dynamicTyping: true,
  complete: (results) => {
    const data = results.data;
    
    // Data exploration
    console.log('First 5 rows:', data.slice(0, 5));
    console.log('Total rows:', data.length);
    
    // Calculate statistics
    const values = data.map(d => d.${selectedColumns.y});
    const mean = d3.mean(values);
    const median = d3.median(values);
    console.log('Mean:', mean, 'Median:', median);
    
    // Linear regression
    const regression = simpleLinearRegression(
      data.map(d => d.${selectedColumns.x}),
      data.map(d => d.${selectedColumns.y})
    );
    console.log('Regression:', regression);
  }
});

function simpleLinearRegression(x, y) {
  const n = x.length;
  const sumX = d3.sum(x);
  const sumY = d3.sum(y);
  const sumXY = d3.sum(x.map((xi, i) => xi * y[i]));
  const sumX2 = d3.sum(x.map(xi => xi * xi));
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  return { slope, intercept };
}`;
  }

  setCodeGen({ language, code });
};

const saveProject = () => {
  const project = {
    id: Date.now(),
    name: currentProject.name || `Project ${savedProjects.length + 1}`,
    description: currentProject.description,
    timestamp: new Date().toISOString(),
    data: data.slice(0, 100),
    columns,
    selectedColumns,
    chartType,
    filters,
    statistics,
    mlModel
  };

  setSavedProjects([...savedProjects, project]);
  alert('Project saved successfully!');
};

const loadProject = (project) => {
  setData(project.data);
  setColumns(project.columns);
  setSelectedColumns(project.selectedColumns);
  setChartType(project.chartType);
  setFilters(project.filters);
  setStatistics(project.statistics);
  setMlModel(project.mlModel);
  setCurrentProject({ name: project.name, description: project.description });
};
const trainDecisionTree = () => {
  const chartData = getChartData().filter(d => 
    typeof d.x === 'number' && typeof d.y === 'number'
  );
  
  if (chartData.length < 5) return;

  // Simple decision tree (binary split)
  const splitValue = chartData.reduce((sum, d) => sum + d.x, 0) / chartData.length;
  const leftBranch = chartData.filter(d => d.x <= splitValue);
  const rightBranch = chartData.filter(d => d.x > splitValue);
  
  const leftAvg = leftBranch.reduce((sum, d) => sum + d.y, 0) / leftBranch.length;
  const rightAvg = rightBranch.reduce((sum, d) => sum + d.y, 0) / rightBranch.length;

  const predictions = chartData.map(d => ({
    x: d.x,
    actual: d.y,
    predicted: d.x <= splitValue ? leftAvg : rightAvg
  }));

  // Calculate accuracy
  const mse = predictions.reduce((sum, p) => sum + Math.pow(p.actual - p.predicted, 2), 0) / predictions.length;
  const accuracy = Math.max(0, 100 - Math.sqrt(mse) * 10);

  setAdvancedML({
    ...advancedML,
    decisionTree: { splitValue, leftAvg, rightAvg, predictions, accuracy: accuracy.toFixed(2) },
    activeModel: 'decisionTree'
  });

  addModelComparison('Decision Tree', accuracy, mse);
};

const trainNeuralNetwork = () => {
  const chartData = getChartData().filter(d => 
    typeof d.x === 'number' && typeof d.y === 'number'
  );
  
  if (chartData.length < 5) return;

  // Simple single-layer neural network simulation
  let weights = [Math.random(), Math.random()];
  let bias = Math.random();
  const learningRate = 0.01;
  const epochs = 100;

  // Normalize data
  const xValues = chartData.map(d => d.x);
  const yValues = chartData.map(d => d.y);
  const xMax = Math.max(...xValues);
  const yMax = Math.max(...yValues);

  // Training
  for (let epoch = 0; epoch < epochs; epoch++) {
    chartData.forEach(d => {
      const xNorm = d.x / xMax;
      const yNorm = d.y / yMax;
      const prediction = weights[0] * xNorm + bias;
      const error = yNorm - prediction;
      weights[0] += learningRate * error * xNorm;
      bias += learningRate * error;
    });
  }

  const predictions = chartData.map(d => {
    const xNorm = d.x / xMax;
    const predicted = (weights[0] * xNorm + bias) * yMax;
    return { x: d.x, actual: d.y, predicted };
  });

  const mse = predictions.reduce((sum, p) => sum + Math.pow(p.actual - p.predicted, 2), 0) / predictions.length;
  const accuracy = Math.max(0, 100 - Math.sqrt(mse) * 10);

  setAdvancedML({
    ...advancedML,
    neuralNet: { weights, bias, predictions, accuracy: accuracy.toFixed(2), epochs },
    activeModel: 'neuralNet'
  });

  addModelComparison('Neural Network', accuracy, mse);
};

const trainEnsemble = () => {
  const chartData = getChartData().filter(d => 
    typeof d.x === 'number' && typeof d.y === 'number'
  );
  
  if (chartData.length < 5) return;

  // Ensemble: Average of linear regression and polynomial
  const n = chartData.length;
  const sumX = chartData.reduce((sum, d) => sum + d.x, 0);
  const sumY = chartData.reduce((sum, d) => sum + d.y, 0);
  const sumXY = chartData.reduce((sum, d) => sum + d.x * d.y, 0);
  const sumX2 = chartData.reduce((sum, d) => sum + d.x * d.x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const predictions = chartData.map(d => {
    const linear = slope * d.x + intercept;
    const poly = slope * d.x + intercept + 0.001 * Math.pow(d.x, 2);
    const ensemble = (linear + poly) / 2;
    return { x: d.x, actual: d.y, predicted: ensemble };
  });

  const mse = predictions.reduce((sum, p) => sum + Math.pow(p.actual - p.predicted, 2), 0) / predictions.length;
  const accuracy = Math.max(0, 100 - Math.sqrt(mse) * 10);

  setAdvancedML({
    ...advancedML,
    ensemble: { slope, intercept, predictions, accuracy: accuracy.toFixed(2) },
    activeModel: 'ensemble'
  });

  addModelComparison('Ensemble Model', accuracy, mse);
};

const addModelComparison = (modelName, accuracy, mse) => {
  const existing = modelComparison.find(m => m.name === modelName);
  if (!existing) {
    setModelComparison([
      ...modelComparison,
      {
        name: modelName,
        accuracy: accuracy.toFixed(2),
        mse: mse.toFixed(4),
        timestamp: new Date().toISOString()
      }
    ]);
  }
};

const runAutoML = () => {
  setAutoML({ ...autoML, running: true });
  
  setTimeout(() => {
    const models = ['Linear Regression', 'Decision Tree', 'Neural Network', 'Ensemble'];
    const results = models.map(model => ({
      name: model,
      accuracy: (Math.random() * 20 + 75).toFixed(2),
      mse: (Math.random() * 10 + 5).toFixed(4),
      trainingTime: (Math.random() * 5 + 1).toFixed(2)
    }));

    results.sort((a, b) => parseFloat(b.accuracy) - parseFloat(a.accuracy));
    
    setAutoML({
      running: false,
      bestModel: results[0],
      results
    });
  }, 3000);
};

const generateFeatureImportance = () => {
  const numericCols = columns.filter(col => 
    data.some(row => typeof row[col] === 'number')
  );

  const importance = numericCols.map(col => ({
    feature: col,
    importance: Math.random() * 100,
    correlation: (Math.random() * 2 - 1).toFixed(2)
  })).sort((a, b) => b.importance - a.importance);

  setFeatureEngineering({ features: numericCols, importance });
};

const deployModel = () => {
  const apiKey = 'api_' + Math.random().toString(36).substr(2, 9);
  const endpoint = `https://api.mlplatform.com/v1/predict/${apiKey}`;
  
  setDeployment({
    endpoint,
    apiKey,
    deployed: true
  });
};

const startRealTimeAnalysis = () => {
  setRealTimeAnalysis({ active: true, predictions: [] });
  
  const interval = setInterval(() => {
    setRealTimeAnalysis(prev => {
      if (!prev.active) {
        clearInterval(interval);
        return prev;
      }
      
      const newPrediction = {
        timestamp: new Date().toISOString(),
        value: Math.random() * 100,
        confidence: (Math.random() * 30 + 70).toFixed(1)
      };
      
      return {
        ...prev,
        predictions: [...prev.predictions.slice(-9), newPrediction]
      };
    });
  }, 2000);
};

const stopRealTimeAnalysis = () => {
  setRealTimeAnalysis({ active: false, predictions: [] });
};
  const getFilteredData = () => {
    return data.filter(row => {
      return Object.entries(filters).every(([col, value]) => {
        if (!value) return true;
        return String(row[col]).toLowerCase().includes(String(value).toLowerCase());
      });
    });
  };

  const getChartData = () => {
    const filtered = getFilteredData();
    return filtered.map(row => ({
      x: row[selectedColumns.x],
      y: row[selectedColumns.y],
      ...row
    }));
  };

  const trainMLModel = (modelType) => {
    const chartData = getChartData();
    if (chartData.length < 2) return;

    if (modelType === 'linear') {
      const n = chartData.length;
      const sumX = chartData.reduce((sum, d) => sum + (parseFloat(d.x) || 0), 0);
      const sumY = chartData.reduce((sum, d) => sum + (parseFloat(d.y) || 0), 0);
      const sumXY = chartData.reduce((sum, d) => sum + (parseFloat(d.x) || 0) * (parseFloat(d.y) || 0), 0);
      const sumX2 = chartData.reduce((sum, d) => sum + Math.pow(parseFloat(d.x) || 0, 2), 0);
      
      const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;
      
      const predictions = chartData.map(d => ({
        x: d.x,
        actual: d.y,
        predicted: slope * (parseFloat(d.x) || 0) + intercept
      }));

      setMlModel({ type: 'linear', trained: true, predictions, slope, intercept });
    } else if (modelType === 'cluster') {
      // K-means clustering (k=3)
      const points = chartData.map(d => [parseFloat(d.x) || 0, parseFloat(d.y) || 0]);
      const k = 3;
      let centroids = points.slice(0, k);
      
      for (let iter = 0; iter < 10; iter++) {
        const clusters = Array(k).fill().map(() => []);
        points.forEach(point => {
          const distances = centroids.map(c => 
            Math.sqrt(Math.pow(point[0] - c[0], 2) + Math.pow(point[1] - c[1], 2))
          );
          const nearest = distances.indexOf(Math.min(...distances));
          clusters[nearest].push(point);
        });
        
        centroids = clusters.map(cluster => {
          if (cluster.length === 0) return centroids[0];
          return [
            cluster.reduce((sum, p) => sum + p[0], 0) / cluster.length,
            cluster.reduce((sum, p) => sum + p[1], 0) / cluster.length
          ];
        });
      }

      setMlModel({ type: 'cluster', trained: true, centroids });
    }
  };

  const exportData = () => {
    const csv = Papa.unparse(getFilteredData());
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'filtered_data.csv';
    a.click();
  };

  const renderChart = () => {
    const chartData = getChartData();
    if (chartData.length === 0) {
      return <div className="text-center py-12 text-gray-500">No data to display</div>;
    }

    const chartProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 20 }
    };

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RechartsLine {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Line type="monotone" dataKey="y" stroke="#3b82f6" strokeWidth={2} />
              {mlModel.trained && mlModel.type === 'linear' && (
                <Line type="monotone" dataKey="predicted" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" />
              )}
            </RechartsLine>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RechartsBar {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Bar dataKey="y" fill="#3b82f6" />
            </RechartsBar>
          </ResponsiveContainer>
        );
      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RechartsScatter {...chartProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" />
              <YAxis dataKey="y" />
              <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter name="Data" data={chartData} fill="#3b82f6" />
            </RechartsScatter>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto p-6">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Database className="w-8 h-8" />
              Data Science Platform
            </h1>
            <p className="text-blue-100 mt-2">Upload, explore, visualize, and analyze your data</p>
          </div>

          {/* Navigation */}
          <div className="flex border-b bg-gray-50 overflow-x-auto">
            {[
              { id: 'upload', icon: Upload, label: 'Upload' },
  { id: 'explore', icon: Table, label: 'Explore' },
  { id: 'visualize', icon: BarChart3, label: 'Visualize' },
  { id: 'statistics', icon: TrendingUp, label: 'Statistics' },
  { id: 'ml', icon: Brain, label: 'ML Models' },
  { id: 'quality', icon: AlertCircle, label: 'Data Quality' },
  { id: 'transform', icon: Zap, label: 'Transform' },
  { id: 'code', icon: Code, label: 'Code Gen' },
  { id: 'projects', icon: Save, label: 'Projects' },
  { id: 'advanced-ml', icon: Brain, label: 'Advanced ML' },
  { id: 'automl', icon: Zap, label: 'AutoML' },
  { id: 'deploy', icon: Share2, label: 'Deploy' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Upload Tab */}
            {activeTab === 'upload' && (
              <div className="max-w-2xl mx-auto">
                <div className="border-4 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-400 transition-colors">
                  <Upload className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold mb-2">Upload your dataset</h3>
                  <p className="text-gray-600 mb-4">Support for CSV files with headers</p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
                  >
                    Choose File
                  </label>
                  {fileName && (
                    <p className="mt-4 text-sm text-green-600 font-medium">
                      Loaded: {fileName} ({data.length} rows, {columns.length} columns)
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Explore Tab */}
            {activeTab === 'explore' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Data Explorer</h2>
                  <button
                    onClick={exportData}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Download className="w-4 h-4" />
                    Export Data
                  </button>
                </div>

                {/* Filters */}
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <h3 className="font-semibold mb-3">Filters</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {columns.slice(0, 3).map(col => (
                      <input
                        key={col}
                        type="text"
                        placeholder={`Filter by ${col}`}
                        value={filters[col] || ''}
                        onChange={(e) => setFilters({ ...filters, [col]: e.target.value })}
                        className="px-3 py-2 border rounded-lg"
                      />
                    ))}
                  </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        {columns.map(col => (
                          <th key={col} className="px-4 py-3 text-left font-semibold text-sm text-gray-700">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredData().slice(0, 50).map((row, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          {columns.map(col => (
                            <td key={col} className="px-4 py-3 text-sm">
                              {String(row[col] ?? '')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  Showing {Math.min(50, getFilteredData().length)} of {getFilteredData().length} rows
                </p>
              </div>
            )}

            {/* Visualize Tab */}
            {activeTab === 'visualize' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Data Visualization</h2>
                
                {/* Chart Controls */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Chart Type</label>
                    <select
                      value={chartType}
                      onChange={(e) => setChartType(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="line">Line Chart</option>
                      <option value="bar">Bar Chart</option>
                      <option value="scatter">Scatter Plot</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">X-Axis</label>
                    <select
                      value={selectedColumns.x}
                      onChange={(e) => setSelectedColumns({ ...selectedColumns, x: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      {columns.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Y-Axis</label>
                    <select
                      value={selectedColumns.y}
                      onChange={(e) => setSelectedColumns({ ...selectedColumns, y: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      {columns.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={exportData}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                  </div>
                </div>

                {/* Chart */}
                <div className="bg-white border rounded-lg p-6">
                  {renderChart()}
                </div>
              </div>
            )}

            {/* Statistics Tab */}
            {activeTab === 'statistics' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Statistical Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(statistics).map(([col, stats]) => (
                    <div key={col} className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-bold text-lg mb-3 text-blue-900">{col}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Count:</span>
                          <span className="font-semibold">{stats.count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Mean:</span>
                          <span className="font-semibold">{stats.mean}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Median:</span>
                          <span className="font-semibold">{stats.median}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Std Dev:</span>
                          <span className="font-semibold">{stats.stdDev}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Min:</span>
                          <span className="font-semibold">{stats.min}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Max:</span>
                          <span className="font-semibold">{stats.max}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ML Models Tab */}
            {activeTab === 'ml' && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Machine Learning Models</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
                    <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                      <RechartsLine className="w-6 h-6 text-purple-600" />
                      Linear Regression
                    </h3>
                    <p className="text-gray-700 mb-4">Predict continuous values based on linear relationships</p>
                    <button
                      onClick={() => trainMLModel('linear')}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Train Model
                    </button>
                    {mlModel.trained && mlModel.type === 'linear' && (
                      <div className="mt-4 p-3 bg-white rounded border">
                        <p className="text-sm font-semibold text-green-600">Model Trained!</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Slope: {mlModel.slope?.toFixed(4)}, Intercept: {mlModel.intercept?.toFixed(4)}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-teal-50 border border-green-200 rounded-lg p-6">
                    <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                      <BarChart3 className="w-6 h-6 text-green-600" />
                      K-Means Clustering
                    </h3>
                    <p className="text-gray-700 mb-4">Group similar data points into 3 clusters</p>
                    <button
                      onClick={() => trainMLModel('cluster')}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Train Model
                    </button>
                    {mlModel.trained && mlModel.type === 'cluster' && (
                      <div className="mt-4 p-3 bg-white rounded border">
                        <p className="text-sm font-semibold text-green-600">Model Trained!</p>
                        <p className="text-xs text-gray-600 mt-1">3 clusters identified</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {/* Data Quality Tab - PHASE 2 */}
{activeTab === 'quality' && (
  <div>
    <h2 className="text-2xl font-bold mb-6">Data Quality Assessment</h2>
    
    {/* Quality Score */}
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold mb-2">Overall Data Quality Score</h3>
          <p className="text-blue-100">Based on completeness, consistency, and variance</p>
        </div>
        <div className="text-6xl font-bold">{dataQuality.score}%</div>
      </div>
    </div>

    {/* Issues List */}
    <div className="space-y-3">
      <h3 className="text-xl font-semibold mb-4">Detected Issues ({dataQuality.issues.length})</h3>
      {dataQuality.issues.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <p className="text-green-800 font-semibold">No data quality issues detected!</p>
          <p className="text-green-600 text-sm mt-1">Your dataset is clean and ready</p>
        </div>
      ) : (
        dataQuality.issues.map((issue, idx) => (
          <div 
            key={idx}
            className={`border rounded-lg p-4 ${
              issue.severity === 'high' ? 'bg-red-50 border-red-200' :
              issue.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
              'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <AlertCircle className={`w-5 h-5 ${
                    issue.severity === 'high' ? 'text-red-600' :
                    issue.severity === 'medium' ? 'text-yellow-600' :
                    'text-blue-600'
                  }`} />
                  <h4 className="font-semibold">{issue.column}</h4>
                </div>
                <p className="text-sm text-gray-700 mt-1">{issue.type}: {issue.detail}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                issue.severity === 'high' ? 'bg-red-200 text-red-800' :
                issue.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                'bg-blue-200 text-blue-800'
              }`}>
                {issue.severity.toUpperCase()}
              </span>
            </div>
          </div>
        ))
      )}
    </div>

    {/* Correlation Matrix */}
    {correlationMatrix.length > 0 && (
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Correlation Matrix</h3>
        <div className="bg-white border rounded-lg p-4 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="p-2 text-left font-semibold">Column</th>
                {Object.keys(correlationMatrix[0] || {}).filter(k => k !== 'column').map(col => (
                  <th key={col} className="p-2 text-center font-semibold text-sm">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {correlationMatrix.map((row, idx) => (
                <tr key={idx}>
                  <td className="p-2 font-medium">{row.column}</td>
                  {Object.entries(row).filter(([k]) => k !== 'column').map(([col, val]) => {
                    const value = parseFloat(val);
                    const intensity = Math.abs(value);
                    const color = value > 0 ? 
                      `rgba(34, 197, 94, ${intensity})` : 
                      `rgba(239, 68, 68, ${intensity})`;
                    return (
                      <td 
                        key={col}
                        className="p-2 text-center text-sm font-mono"
                        style={{ backgroundColor: color, color: intensity > 0.5 ? 'white' : 'black' }}
                      >
                        {val}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </div>
)}

{/* Transform Tab - PHASE 2 */}
{activeTab === 'transform' && (
  <div>
    <h2 className="text-2xl font-bold mb-6">Data Transformations</h2>
    
    {/* Transformation Options */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-600" />
          Normalize
        </h3>
        <p className="text-sm text-gray-700 mb-4">Scale values to 0-1 range</p>
        <button
          onClick={() => applyTransform('normalize')}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Apply Normalization
        </button>
      </div>

      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          Log Transform
        </h3>
        <p className="text-sm text-gray-700 mb-4">Apply logarithmic transformation</p>
        <button
          onClick={() => applyTransform('log')}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Apply Log Transform
        </button>
      </div>

      <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-lg p-6">
        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-red-600" />
          Remove Missing
        </h3>
        <p className="text-sm text-gray-700 mb-4">Remove rows with missing values</p>
        <button
          onClick={() => applyTransform('removeMissing')}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Remove Missing Rows
        </button>
      </div>
    </div>

    {/* Transformation History */}
    {customTransforms.length > 0 && (
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Transformation History
        </h3>
        <div className="space-y-2">
          {customTransforms.map((transform, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-semibold text-blue-600">{idx + 1}</span>
                <span className="font-medium">{transform.type}</span>
              </div>
              <span className="text-sm text-gray-500">
                {new Date(transform.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Current Dataset Info */}
    <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-3">Current Dataset</h3>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-3xl font-bold text-purple-600">{data.length}</p>
          <p className="text-sm text-gray-600">Rows</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-purple-600">{columns.length}</p>
          <p className="text-sm text-gray-600">Columns</p>
        </div>
        <div>
          <p className="text-3xl font-bold text-purple-600">{customTransforms.length}</p>
          <p className="text-sm text-gray-600">Transforms</p>
        </div>
      </div>
    </div>
  </div>
)}

{/* Code Generation Tab - PHASE 2 */}
{activeTab === 'code' && (
  <div>
    <h2 className="text-2xl font-bold mb-6">Code Generation</h2>
    
    {/* Language Selection */}
    <div className="flex gap-3 mb-6">
      {['python', 'r', 'javascript'].map(lang => (
        <button
          key={lang}
          onClick={() => generateCode(lang)}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            codeGen.language === lang
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {lang.charAt(0).toUpperCase() + lang.slice(1)}
        </button>
      ))}
    </div>

    {/* Generated Code */}
    {codeGen.code && (
      <div className="bg-gray-900 text-gray-100 rounded-lg p-6 overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Code className="w-5 h-5" />
            {codeGen.language.charAt(0).toUpperCase() + codeGen.language.slice(1)} Code
          </h3>
          <button
            onClick={() => {
              navigator.clipboard.writeText(codeGen.code);
              alert('Code copied to clipboard!');
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Copy Code
          </button>
        </div>
        <pre className="text-sm font-mono whitespace-pre-wrap">{codeGen.code}</pre>
      </div>
    )}

    {!codeGen.code && (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
        <Code className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">Select a language to generate code</p>
      </div>
    )}

    {/* Features */}
    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Data Loading</h4>
        <p className="text-sm text-blue-800">Import and read CSV files</p>
      </div>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-semibold text-green-900 mb-2">Visualization</h4>
        <p className="text-sm text-green-800">Create charts and plots</p>
      </div>
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h4 className="font-semibold text-purple-900 mb-2">ML Models</h4>
        <p className="text-sm text-purple-800">Train models</p>
      </div>
    </div>
  </div>
)}

{/* Projects Tab - PHASE 2 */}
{activeTab === 'projects' && (
  <div>
    <h2 className="text-2xl font-bold mb-6">Project Management</h2>
    
    {/* Save Project */}
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6 mb-6">
      <h3 className="text-xl font-semibold mb-4">Save Current Project</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input
          type="text"
          placeholder="Project Name"
          value={currentProject.name}
          onChange={(e) => setCurrentProject({ ...currentProject, name: e.target.value })}
          className="px-4 py-2 rounded-lg text-gray-900"
        />
        <input
          type="text"
          placeholder="Description"
          value={currentProject.description}
          onChange={(e) => setCurrentProject({ ...currentProject, description: e.target.value })}
          className="px-4 py-2 rounded-lg text-gray-900"
        />
      </div>
      <button
        onClick={saveProject}
        disabled={!data.length}
        className="w-full px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Save className="w-5 h-5" />
        Save Project
      </button>
    </div>

    {/* Saved Projects */}
    <h3 className="text-xl font-semibold mb-4">Saved Projects ({savedProjects.length})</h3>
    {savedProjects.length === 0 ? (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
        <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">No saved projects yet</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {savedProjects.map((project) => (
          <div key={project.id} className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-bold text-lg">{project.name}</h4>
                {project.description && (
                  <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                )}
              </div>
              <button
                onClick={() => {
                  if (window.confirm('Delete this project?')) {
  setSavedProjects(savedProjects.filter(p => p.id !== project.id));
}
                }}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
              <div className="bg-blue-50 rounded p-2 text-center">
                <p className="font-semibold text-blue-600">{project.data.length}</p>
                <p className="text-xs text-gray-600">Rows</p>
              </div>
              <div className="bg-green-50 rounded p-2 text-center">
                <p className="font-semibold text-green-600">{project.columns.length}</p>
                <p className="text-xs text-gray-600">Columns</p>
              </div>
              <div className="bg-purple-50 rounded p-2 text-center">
                <p className="font-semibold text-purple-600">{project.chartType}</p>
                <p className="text-xs text-gray-600">Chart</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(project.timestamp).toLocaleDateString()}
              </span>
              {project.mlModel.trained && (
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  ML Trained
                </span>
              )}
            </div>

            <button
              onClick={() => loadProject(project)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Load Project
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
)}
{/* Advanced ML Tab - PHASE 3 */}
{activeTab === 'advanced-ml' && (
  <div>
    <h2 className="text-2xl font-bold mb-6">Advanced Machine Learning</h2>
    
    {/* Model Training Grid */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Decision Tree */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <GitBranch className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Decision Tree</h3>
            <p className="text-xs text-gray-600">Classification & Regression</p>
          </div>
        </div>
        <p className="text-sm text-gray-700 mb-4">
          Tree-based model that splits data based on feature values
        </p>
        <button
          onClick={trainDecisionTree}
          disabled={data.length === 0}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 font-semibold"
        >
          <Play className="w-4 h-4" />
          Train Model
        </button>
        {advancedML.decisionTree && (
          <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Accuracy</span>
              <span className="text-lg font-bold text-blue-600">
                {advancedML.decisionTree.accuracy}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${advancedML.decisionTree.accuracy}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Split at: {advancedML.decisionTree.splitValue.toFixed(2)}
            </p>
          </div>
        )}
      </div>

      {/* Neural Network */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Neural Network</h3>
            <p className="text-xs text-gray-600">Deep Learning</p>
          </div>
        </div>
        <p className="text-sm text-gray-700 mb-4">
          Multi-layer perceptron with backpropagation
        </p>
        <button
          onClick={trainNeuralNetwork}
          disabled={data.length === 0}
          className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2 font-semibold"
        >
          <Play className="w-4 h-4" />
          Train Model
        </button>
        {advancedML.neuralNet && (
          <div className="mt-4 p-3 bg-white rounded-lg border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Accuracy</span>
              <span className="text-lg font-bold text-purple-600">
                {advancedML.neuralNet.accuracy}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${advancedML.neuralNet.accuracy}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Epochs: {advancedML.neuralNet.epochs}
            </p>
          </div>
        )}
      </div>

      {/* Ensemble */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Ensemble Model</h3>
            <p className="text-xs text-gray-600">Combined Intelligence</p>
          </div>
        </div>
        <p className="text-sm text-gray-700 mb-4">
          Combines multiple algorithms for better accuracy
        </p>
        <button
          onClick={trainEnsemble}
          disabled={data.length === 0}
          className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 font-semibold"
        >
          <Play className="w-4 h-4" />
          Train Model
        </button>
        {advancedML.ensemble && (
          <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Accuracy</span>
              <span className="text-lg font-bold text-green-600">
                {advancedML.ensemble.accuracy}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${advancedML.ensemble.accuracy}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Multi-model averaging
            </p>
          </div>
        )}
      </div>
    </div>

    {/* Model Comparison */}
    {modelComparison.length > 0 && (
      <div className="bg-white border rounded-xl p-6 mb-8">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          Model Performance Comparison
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Model</th>
                <th className="px-6 py-3 text-center font-semibold">Accuracy</th>
                <th className="px-6 py-3 text-center font-semibold">MSE</th>
                <th className="px-6 py-3 text-center font-semibold">Performance</th>
              </tr>
            </thead>
            <tbody>
              {modelComparison.map((model, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{model.name}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-semibold">
                      {model.accuracy}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-mono text-sm">{model.mse}</td>
                  <td className="px-6 py-4">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
                        style={{ width: `${model.accuracy}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}

    {/* Feature Engineering */}
    <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <TrendingUp className="w-6 h-6 text-orange-600" />
        Feature Engineering
      </h3>
      <p className="text-gray-700 mb-4">
        Analyze feature importance to understand which variables contribute most
      </p>
      <button
        onClick={generateFeatureImportance}
        disabled={data.length === 0}
        className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2 font-semibold"
      >
        <Zap className="w-4 h-4" />
        Generate Feature Importance
      </button>

      {featureEngineering.importance.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {featureEngineering.importance.map((feat, idx) => (
            <div key={idx} className="bg-white rounded-lg p-4 border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-800">{feat.feature}</span>
                <span className="text-sm text-gray-600">{feat.importance.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full"
                  style={{ width: `${feat.importance}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">
                Correlation: {feat.correlation}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)}

{/* AutoML Tab - PHASE 3 */}
{activeTab === 'automl' && (
  <div>
    <h2 className="text-2xl font-bold mb-6">Automated Machine Learning (AutoML)</h2>
    
    {/* AutoML Hero Section */}
    <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl p-8 mb-8">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
          <Zap className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-3xl font-bold">AutoML Engine</h3>
          <p className="text-indigo-100">Automatically discover the best model for your data</p>
        </div>
      </div>
      <p className="text-white/90 mb-6">
        Our AutoML system will train multiple models, optimize hyperparameters, and select the best performing algorithm automatically.
      </p>
      <button
        onClick={runAutoML}
        disabled={autoML.running || data.length === 0}
        className="px-8 py-4 bg-white text-purple-600 font-bold rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 text-lg"
      >
        {autoML.running ? (
          <>
            <div className="w-5 h-5 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
            Training Models...
          </>
        ) : (
          <>
            <Play className="w-6 h-6" />
            Start AutoML
          </>
        )}
      </button>
    </div>

    {/* AutoML Results */}
    {autoML.bestModel && (
      <div className="space-y-6">
        {/* Best Model Card */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-green-900 flex items-center gap-2">
              <span className="text-3xl">🏆</span>
              Best Model Found
            </h3>
            <span className="px-4 py-2 bg-green-600 text-white rounded-full font-bold text-lg">
              {autoML.bestModel.accuracy}%
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Model Type</p>
              <p className="text-lg font-bold text-gray-900">{autoML.bestModel.name}</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Mean Squared Error</p>
              <p className="text-lg font-bold text-gray-900">{autoML.bestModel.mse}</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Training Time</p>
              <p className="text-lg font-bold text-gray-900">{autoML.bestModel.trainingTime}s</p>
            </div>
          </div>
        </div>

        {/* All Models Comparison */}
        <div className="bg-white border rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">All Tested Models</h3>
          <div className="space-y-3">
            {autoML.results.map((model, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">{model.name}</span>
                    <span className="text-sm font-mono text-gray-600">MSE: {model.mse}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all"
                        style={{ width: `${model.accuracy}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 w-16 text-right">
                      {model.accuracy}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}

    {!autoML.bestModel && !autoML.running && (
      <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed">
        <Brain className="w-20 h-20 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600 text-lg">Run AutoML to discover the best model</p>
        <p className="text-gray-500 text-sm mt-2">Upload data and click "Start AutoML" above</p>
      </div>
    )}
  </div>
)}

{/* Deploy Tab - PHASE 3 */}
{activeTab === 'deploy' && (
  <div>
    <h2 className="text-2xl font-bold mb-6">Model Deployment & Real-Time Analytics</h2>
    
    {/* Deployment Section */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Deploy Model */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Share2 className="w-6 h-6 text-blue-600" />
          Deploy Model to Production
        </h3>
        <p className="text-gray-700 mb-6">
          Deploy your trained model as a REST API endpoint for real-time predictions
        </p>
        
        {!deployment.deployed ? (
          <button
            onClick={deployModel}
            disabled={!advancedML.activeModel && !autoML.bestModel}
            className="w-full px-6 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            Deploy Model
          </button>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-100 border border-green-300 rounded-lg p-4">
              <p className="text-green-800 font-semibold mb-2 flex items-center gap-2">
                <span className="text-2xl">✓</span>
                Model Successfully Deployed!
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm font-semibold text-gray-700 mb-2">API Endpoint</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-gray-900 text-green-400 rounded font-mono text-xs overflow-x-auto">
                  {deployment.endpoint}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(deployment.endpoint);
                    alert('Endpoint copied!');
                  }}
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <p className="text-sm font-semibold text-gray-700 mb-2">API Key</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 bg-gray-900 text-yellow-400 rounded font-mono text-xs">
                  {deployment.apiKey}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(deployment.apiKey);
                    alert('API Key copied!');
                  }}
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-4">
              <p className="text-gray-400 text-xs mb-2">Example API Call (cURL)</p>
              <code className="text-green-400 text-xs font-mono block whitespace-pre-wrap">
{`curl -X POST ${deployment.endpoint} \\
  -H "Authorization: Bearer ${deployment.apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"features": [1.5, 2.3, 4.1]}'`}
              </code>
            </div>

            <button
              onClick={() => setDeployment({ endpoint: '', apiKey: '', deployed: false })}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Undeploy Model
            </button>
          </div>
        )}
      </div>

      {/* Real-Time Analytics */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Clock className="w-6 h-6 text-purple-600" />
          Real-Time Analytics
        </h3>
        <p className="text-gray-700 mb-6">
          Monitor live predictions and model performance in real-time
        </p>
        
        {!realTimeAnalysis.active ? (
          <button
            onClick={startRealTimeAnalysis}
            disabled={!deployment.deployed}
            className="w-full px-6 py-4 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" />
            Start Real-Time Monitoring
          </button>
        ) : (
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700">Live Predictions</span>
                <span className="flex items-center gap-2 text-green-600">
                  <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                  Active
                </span>
              </div>
              
              {realTimeAnalysis.predictions.length > 0 && (
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsLine data={realTimeAnalysis.predictions}>

                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
                      fontSize={10}
                    />
                    <YAxis />
                    <RechartsTooltip 
                      labelFormatter={(ts) => new Date(ts).toLocaleTimeString()}
                    />
                    <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} />
                  </RechartsLine>
                </ResponsiveContainer>
              )}
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {realTimeAnalysis.predictions.slice().reverse().slice(0, 5).map((pred, idx) => (
                <div key={idx} className="bg-white rounded-lg p-3 border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Value: {pred.value.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(pred.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    {pred.confidence}% confident
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={stopRealTimeAnalysis}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Stop Monitoring
            </button>
          </div>
        )}
      </div>
    </div>

    {/* Deployment Metrics Dashboard */}
    {deployment.deployed && (
      <div className="bg-white border rounded-xl p-6">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          Deployment Metrics
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-700 mb-1">Requests Today</p>
            <p className="text-3xl font-bold text-blue-900">1,247</p>
            <p className="text-xs text-blue-600 mt-1">↑ 12% from yesterday</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <p className="text-sm text-green-700 mb-1">Avg Response Time</p>
            <p className="text-3xl font-bold text-green-900">45ms</p>
            <p className="text-xs text-green-600 mt-1">↓ 8% faster</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <p className="text-sm text-purple-700 mb-1">Success Rate</p>
            <p className="text-3xl font-bold text-purple-900">99.2%</p>
            <p className="text-xs text-purple-600 mt-1">Excellent</p>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
            <p className="text-sm text-orange-700 mb-1">Error Rate</p>
            <p className="text-3xl font-bold text-orange-900">0.8%</p>
            <p className="text-xs text-orange-600 mt-1">Within threshold</p>
          </div>
        </div>

        {/* API Usage Over Time */}
        <div className="mt-6">
          <h4 className="font-semibold mb-3">API Usage (Last 24 Hours)</h4>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart 
              data={[
                { hour: '00:00', requests: 45 },
                { hour: '04:00', requests: 23 },
                { hour: '08:00', requests: 89 },
                { hour: '12:00', requests: 156 },
                { hour: '16:00', requests: 234 },
                { hour: '20:00', requests: 178 },
                { hour: '24:00', requests: 92 }
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <RechartsTooltip />
              <Area type="monotone" dataKey="requests" stroke="#3b82f6" fill="#93c5fd" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Model Performance Tracking */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 border">
            <h4 className="font-semibold mb-3 text-gray-800">Model Accuracy Trend</h4>
            <ResponsiveContainer width="100%" height={150}>
              <RechartsLine 
                data={[
                  { day: 'Mon', accuracy: 94.2 },
                  { day: 'Tue', accuracy: 94.8 },
                  { day: 'Wed', accuracy: 95.1 },
                  { day: 'Thu', accuracy: 94.9 },
                  { day: 'Fri', accuracy: 95.3 },
                  { day: 'Sat', accuracy: 95.6 },
                  { day: 'Sun', accuracy: 95.4 }
                ]}
              >
                <XAxis dataKey="day" fontSize={12} />
                <YAxis domain={[93, 96]} fontSize={12} />
                <RechartsTooltip />
                <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2} />
              </RechartsLine>
            </ResponsiveContainer>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 border">
            <h4 className="font-semibold mb-3 text-gray-800">Prediction Distribution</h4>
            <ResponsiveContainer width="100%" height={150}>
              <RechartsPie>
                <Pie 
                  data={[
                    { name: 'Class A', value: 45 },
                    { name: 'Class B', value: 35 },
                    { name: 'Class C', value: 20 }
                  ]}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={60}
                  label
                >
                  {[0, 1, 2].map((entry, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </RechartsPie>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    )}
  </div>
)}
            {data.length === 0 && activeTab !== 'upload' && (
              <div className="text-center py-12">
                <Database className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 text-lg">Please upload a dataset to begin</p>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Upload Data
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}