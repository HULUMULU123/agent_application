import React, { useEffect, useRef, useState } from 'react';
import Header from './components/Header.jsx';
import Roadmap from './components/Roadmap.jsx';
import StepUpload from './components/steps/StepUpload.jsx';
import StepTransactions from './components/steps/StepTransactions.jsx';
import StepCounterparties from './components/steps/StepCounterparties.jsx';
import StepLegal from './components/steps/StepLegal.jsx';
import StatisticsPage from './components/pages/StatisticsPage.jsx';
import HistoryPage from './components/pages/HistoryPage.jsx';
import OverlayLoader from './components/OverlayLoader.jsx';

import './styles/App.css';

const steps = [
  {
    id: 1,
    title: 'Импорт выписки',
    description: 'Загрузите PDF, CSV или XLS, мы проверим корректность и подготовим структуру данных.',
  },
  {
    id: 2,
    title: 'Анализ транзакций',
    description: 'Нормализуем, классифицируем и строим распределение потоков денег.',
  },
  {
    id: 3,
    title: 'Контрагенты',
    description: 'Оценка рисков, выявление аномалий и рейтинги надежности партнеров.',
  },
  {
    id: 4,
    title: 'Юридический отчет',
    description: 'Готовим комплаенс-резюме, подсвечиваем рисковые блоки и рекомендации.',
  },
];

const stepInsights = {
  1: {
    title: 'Что делает Агент на шаге импорта',
    bullets: [
      'Считывает формат и выравнивает колонки выписки, чтобы не терялась структура.',
      'Находит потенциальные ошибки в данных до запуска аналитики.',
      'Подготавливает быстрый предпросмотр, чтобы подтвердить корректность файла.',
    ],
  },
  2: {
    title: 'Что происходит в аналитике транзакций',
    bullets: [
      'Классификация поступлений и списаний с учетом ваших правил.',
      'Построение распределения сумм для поиска аномальных платежей.',
      'Сопоставление с историей балансов и расчет ключевых метрик.',
    ],
  },
  3: {
    title: 'Как оцениваем контрагентов',
    bullets: [
      'Отслеживаем динамику взаимодействий и изменения в поведении.',
      'Считаем риск-профиль на основе открытых источников и внутренних тегов.',
      'Выделяем сигналы и события, которые требуют внимания аналитика.',
    ],
  },
  4: {
    title: 'Формирование юридического отчета',
    bullets: [
      'Собираем обязательства, дедлайны и статусы документов.',
      'Присваиваем уровень риска и подготавливаем рекомендации по действиям.',
      'Готовим материалы для юридического отдела и службы безопасности.',
    ],
  },
};

export default function App() {
  const [activePage, setActivePage] = useState('Главная');
  const [activeStep, setActiveStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const timeoutsRef = useRef([]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      timeoutsRef.current = [];
    };
  }, []);

  const handleNavigate = (page) => {
    setActivePage(page);
  };

  const handleStartAnalysis = () => {
    if (isAnalyzing) return;
    setActivePage('Главная');
    setIsAnalyzing(true);
    setActiveStep(1);

    timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    timeoutsRef.current = [];

    steps.forEach((step, index) => {
      if (index === 0) return;
      const timeoutId = setTimeout(() => {
        setActiveStep(2);
        if (index === 1) {
          setIsAnalyzing(false);
        }
      }, index * 1000);
      timeoutsRef.current.push(timeoutId);
    });
  };

  const handleStepClick = (stepId) => {
    setActiveStep(stepId);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return <StepUpload onStartAnalysis={handleStartAnalysis} disabled={isAnalyzing} />;
      case 2:
        return <StepTransactions />;
      case 3:
        return <StepCounterparties />;
      case 4:
      default:
        return <StepLegal />;
    }
  };

  const insight = stepInsights[activeStep];

  const mainPage = (
    <div className="content-wrapper">
      <Roadmap steps={steps} activeStep={activeStep} onStepClick={handleStepClick} isAnalyzing={isAnalyzing} />
      <aside className="page-card">
          <h3 className="section-title">{insight.title}</h3>
          <ul className="insight-list">
            {insight.bullets.map((item) => (
              <li key={item} className="insight-item">
                <span className="insight-marker" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </aside>
      <div className="page-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>{renderStepContent()}</div>
        
      </div>
    </div>
  );

  const renderPage = () => {
    switch (activePage) {
      case 'Статистика':
        return <StatisticsPage />;
      case 'История':
        return <HistoryPage />;
      case 'Главная':
      default:
        return mainPage;
    }
  };

  return (
    <div className="app-shell">
      <Header activePage={activePage} onNavigate={handleNavigate} />
      {renderPage()}
      <OverlayLoader visible={isAnalyzing} label="Агент обрабатывает этапы и собирает инсайты…" />
    </div>
  );
}
