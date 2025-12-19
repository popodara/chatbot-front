import { Routes, Route } from 'react-router-dom';

import ChatbotPage from './pages/chatbot/ChatbotModalReal';

function App() {
   return (
       <>
        <div className="min-h-screen min-w-full bg-white dark:bg-dark-primary transition-colors">
          <Routes>
            <Route path="/" element={<ChatbotPage />} />
          </Routes>
        </div>
        
       </>
  );
}

export default App;