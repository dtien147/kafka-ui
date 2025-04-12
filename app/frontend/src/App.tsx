import React from 'react';
import { HashRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import Layout from './Layout';
import Topics from './pages/Topics';
import Schemas from './pages/Schemas';
import ConsumerGroups from './pages/ConsumerGroups';
import AvroProducer from './pages/AvroProducer';
import TopicDetail from './pages/TopicDetail';
import AvroManager from './pages/AvroManager';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Topics />} />
          <Route path="/schemas" element={<Schemas />} />
          <Route path="/groups" element={<ConsumerGroups />} />
          <Route path="/producer" element={<AvroProducer />} />
          <Route path="/topic/:name" element={<TopicDetailWrapper />} />
          <Route path="/avro" element={<AvroManager />} />
        </Routes>
      </Layout>
    </Router>
  );
}

function TopicDetailWrapper() {
  const { name } = useParams();
  return name ? <TopicDetail topic={name} /> : null;
}

export default App;
