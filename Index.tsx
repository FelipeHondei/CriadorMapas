import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Plus, Trash2, Edit2, Map, X, Check } from 'lucide-react';

const HeatmapManager = () => {
  const [clusters, setClusters] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    latitude: '',
    longitude: '',
    pontos: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const { nome, latitude, longitude, pontos } = formData;
    
    if (!nome.trim()) {
      alert('Por favor, insira um nome para a localização');
      return false;
    }
    
    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const pts = parseInt(pontos);
    
    if (isNaN(lat) || lat < -90 || lat > 90) {
      alert('Latitude deve ser um número entre -90 e 90');
      return false;
    }
    
    if (isNaN(lon) || lon < -180 || lon > 180) {
      alert('Longitude deve ser um número entre -180 e 180');
      return false;
    }
    
    if (isNaN(pts) || pts < 1 || pts > 100) {
      alert('Número de pontos deve ser entre 1 e 100');
      return false;
    }
    
    return true;
  };

  const addCluster = () => {
    if (!validateForm()) return;

    const newCluster = {
      id: Date.now(),
      nome: formData.nome,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      pontos: parseInt(formData.pontos)
    };

    setClusters(prev => [...prev, newCluster]);
    resetForm();
  };

  const updateCluster = () => {
    if (!validateForm()) return;

    setClusters(prev => prev.map(cluster => 
      cluster.id === editingId 
        ? {
            ...cluster,
            nome: formData.nome,
            latitude: parseFloat(formData.latitude),
            longitude: parseFloat(formData.longitude),
            pontos: parseInt(formData.pontos)
          }
        : cluster
    ));
    resetForm();
  };

  const deleteCluster = (id) => {
    const confirmed = window.confirm('Tem certeza que deseja remover esta coordenada?');
    if (confirmed) {
      setClusters(prev => prev.filter(c => c.id !== id));
      if (editingId === id) {
        resetForm();
      }
    }
  };

  const startEdit = (cluster) => {
    setEditingId(cluster.id);
    setFormData({
      nome: cluster.nome,
      latitude: cluster.latitude.toString(),
      longitude: cluster.longitude.toString(),
      pontos: cluster.pontos.toString()
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ nome: '', latitude: '', longitude: '', pontos: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const clearAll = () => {
    const confirmed = window.confirm('Tem certeza que deseja limpar todas as coordenadas?');
    if (confirmed) {
      setClusters([]);
      resetForm();
    }
  };

  const generateMap = () => {
    if (clusters.length === 0) {
      alert('Adicione pelo menos uma coordenada antes de gerar o mapa!');
      return;
    }
    setShowMap(true);
  };

  const processMapData = () => {
    const avgLat = clusters.reduce((sum, c) => sum + c.latitude, 0) / clusters.length;
    const avgLon = clusters.reduce((sum, c) => sum + c.longitude, 0) / clusters.length;

    let latList = [];
    let lonList = [];
    let valList = [];

    clusters.forEach(cluster => {
      const spreadDeg = 0.008;
      const nx = Math.ceil(Math.sqrt(cluster.pontos));
      const ny = Math.ceil(cluster.pontos / nx);

      const xOffsets = Array.from({ length: nx }, (_, i) => 
        -spreadDeg/2 + (spreadDeg * i / (nx - 1 || 1))
      );
      const yOffsets = Array.from({ length: ny }, (_, i) => 
        -spreadDeg/2 + (spreadDeg * i / (ny - 1 || 1))
      );

      let count = 0;
      for (let y of yOffsets) {
        for (let x of xOffsets) {
          if (count >= cluster.pontos) break;
          latList.push(cluster.latitude + y);
          lonList.push(cluster.longitude + x);
          valList.push(cluster.pontos / 300.0);
          count++;
        }
        if (count >= cluster.pontos) break;
      }
    });

    return { latList, lonList, valList, avgLat, avgLon };
  };

  if (showMap) {
    return (
      <MapView 
        clusters={clusters} 
        onBack={() => setShowMap(false)}
        processMapData={processMapData}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-3 rounded-lg">
                <Map className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Gerenciador de Mapas de Calor</h1>
                <p className="text-gray-600">Adicione coordenadas e gere mapas interativos</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Total de Pontos</div>
              <div className="text-3xl font-bold text-indigo-600">
                {clusters.reduce((sum, c) => sum + c.pontos, 0)}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {editingId ? 'Editar Coordenada' : 'Nova Coordenada'}
                </h2>
                {showForm && (
                  <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {!showForm && !editingId ? (
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2 font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  Adicionar Coordenada
                </button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome da Localização
                    </label>
                    <input
                      type="text"
                      name="nome"
                      value={formData.nome}
                      onChange={handleInputChange}
                      placeholder="Ex: São Paulo"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Latitude
                    </label>
                    <input
                      type="number"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      placeholder="-23.550520"
                      step="0.000001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Longitude
                    </label>
                    <input
                      type="number"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      placeholder="-46.633308"
                      step="0.000001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de Pontos (1-100)
                    </label>
                    <input
                      type="number"
                      name="pontos"
                      value={formData.pontos}
                      onChange={handleInputChange}
                      placeholder="10"
                      min="1"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex gap-2">
                    {editingId ? (
                      <>
                        <button
                          onClick={updateCluster}
                          className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Salvar
                        </button>
                        <button
                          onClick={resetForm}
                          className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={addCluster}
                        className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  Coordenadas Cadastradas ({clusters.length})
                </h2>
                {clusters.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Limpar Todas
                  </button>
                )}
              </div>

              {clusters.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Nenhuma coordenada cadastrada</p>
                  <p className="text-sm">Adicione coordenadas para gerar o mapa</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {clusters.map(cluster => (
                    <div
                      key={cluster.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 mb-2">{cluster.nome}</h3>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>
                              <span className="text-gray-500">Lat:</span>
                              <span className="ml-1 font-mono text-gray-700">{cluster.latitude.toFixed(6)}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Lon:</span>
                              <span className="ml-1 font-mono text-gray-700">{cluster.longitude.toFixed(6)}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Pontos:</span>
                              <span className="ml-1 font-semibold text-indigo-600">{cluster.pontos}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => startEdit(cluster)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteCluster(cluster.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Remover"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {clusters.length > 0 && (
              <button
                onClick={generateMap}
                className="w-full mt-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-lg hover:from-green-600 hover:to-emerald-700 transition shadow-lg hover:shadow-xl flex items-center justify-center gap-3 text-lg font-bold"
              >
                <Map className="w-6 h-6" />
                Gerar Mapa de Calor
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MapView = ({ clusters, onBack, processMapData }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const { latList, lonList, valList, avgLat, avgLon } = processMapData();

    const leafletScript = document.createElement('script');
    leafletScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    leafletScript.onload = () => {
      const heatScript = document.createElement('script');
      heatScript.src = 'https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js';
      heatScript.onload = () => {
        initMap();
      };
      document.head.appendChild(heatScript);
    };
    document.head.appendChild(leafletScript);

    const leafletCSS = document.createElement('link');
    leafletCSS.rel = 'stylesheet';
    leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(leafletCSS);

    const initMap = () => {
      const L = window.L;
      
      const map = L.map(mapContainerRef.current).setView([avgLat, avgLon], 7);
      mapRef.current = map;

      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri',
        maxZoom: 13
      }).addTo(map);

      const heatData = latList.map((lat, i) => {
        const normalizedVal = (valList[i] - Math.min(...valList)) / 
          (Math.max(...valList) - Math.min(...valList) + 1e-10);
        return [lat, lonList[i], normalizedVal];
      });

      L.heatLayer(heatData, {
        radius: 25,
        blur: 30,
        maxZoom: 13,
        gradient: {
          0.0: 'blue',
          0.3: 'cyan',
          0.5: 'yellow',
          0.7: 'red'
        }
      }).addTo(map);

      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    };

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [processMapData]);

  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="bg-white shadow-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Mapa de Calor</h1>
            <p className="text-sm text-gray-600">{clusters.length} localizações</p>
          </div>
        </div>
      </div>
      <div ref={mapContainerRef} className="flex-1" style={{ height: '100%' }} />
    </div>
  );
};

export default HeatmapManager;