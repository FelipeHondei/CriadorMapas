import numpy as np
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap
from scipy.ndimage import gaussian_filter
import folium
from folium.plugins import HeatMap
import contextily as ctx
from pyproj import Transformer

class MapaCalorGeografico:
    """
    Classe para criar mapas de calor geográficos sobre mapas reais
    """
    
    def __init__(self, figsize=(15, 12)):
        self.figsize = figsize
    
    def criar_mapa_interativo_folium(self, lat, lon, valores=None,
                                     centro_lat=803.55, centro_lon= 846.63,
                                     zoom_inicial=0, 
                                     nome_arquivo='mapa_calor.html'):
        """
        Cria mapa de calor interativo usando Folium (salva em HTML)
        
        Args:
            lat: Lista de latitudes
            lon: Lista de longitudes  
            valores: Intensidade de cada ponto (opcional)
            centro_lat: Latitude do centro do mapa
            centro_lon: Longitude do centro do mapa
            zoom_inicial: Nível de zoom inicial
            nome_arquivo: Nome do arquivo HTML a ser salvo
        """
        # Criar mapa base com Esri World Gray Canvas
        mapa = folium.Map(
            location=[centro_lat, centro_lon],
            zoom_start=zoom_inicial,
            tiles='https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
            attr='Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
            max_zoom=13
        )
    
        
        # Preparar dados para heatmap
        if valores is None:
            # Se não houver valores, usar intensidade uniforme
            heat_data = [[lat[i], lon[i]] for i in range(len(lat))]
        else:
            # Normalizar valores para 0-1
            valores_norm = np.array(valores)
            valores_norm = (valores_norm - valores_norm.min()) / \
                          (valores_norm.max() - valores_norm.min() + 1e-10)
            heat_data = [[lat[i], lon[i], valores_norm[i]] 
                        for i in range(len(lat))]
        
        # Adicionar camada de heatmap
        HeatMap(
            heat_data,
            min_opacity=0.3,
            max_opacity=0.8,
            radius=25,
            blur=30,
            gradient={
                0.0: 'blue',
                0.3: 'cyan',
                0.5: 'yellow',
                0.7: 'red'
            }
        ).add_to(mapa)
        
        # Adicionar marcadores nos pontos (opcional, para poucos pontos)
        if len(lat) <= 50:
            for i in range(len(lat)):
                valor_texto = f"{valores[i]:.1f}" if valores else "Ponto"
                folium.CircleMarker(
                    location=[lat[i], lon[i]],
                    radius=5,
                    popup=f"Valor: {valor_texto}",
                    color='darkred',
                    fill=True,
                    fillColor='red',
                    fillOpacity=0.6
                ).add_to(mapa)
        
        # Salvar mapa
        mapa.save(nome_arquivo)
        print(f"✓ Mapa interativo salvo em: {nome_arquivo}")
        print(f"  Abra o arquivo no navegador para visualizar")
        
        return mapa

# ============== EXEMPLOS DE USO ==============

if __name__ == "__main__":
    
    gerador = MapaCalorGeografico()
    
    # Exemplo 1: Mapa de calor sobre São Paulo (matplotlib + contextily)
    print("Exemplo 1: Mapa com Fundo - Região de São Paulo")
    
    
    # Simular dados da região de São Paulo
    clusters = [
        (-23.985285, -48.875141, 5), # Itapeva
        (-23.811661, -48.591596, 10), # Buri
        (-24.500003, -47.848789, 10), # Registro
        (-23.536829, -48.412091, 10), # Angatuba
        (-22.746406, -48.569203, 10), # São Manuel
        (-22.350694, -49.048482, 10), # Bauru
        (-22.245229, -49.940631, 10), # Marilia
        (-22.951670, -49.880425, 10), # Ourinhos
        (-22.641928, -50.416452, 10), # Assis
        (-22.383574, -50.577648, 10), # Paraguaçu Paulista
        (-22.238039, -51.313714, 10), # Regente Feijó
        (-22.278883, -51.262019, 10), # Regente Feijó
        (-21.814952, -50.876736, 10), # Osvaldo Cruz
        (-21.227771, -50.449468, 10), # Araçatuba
        (-20.916063, -51.387515, 10), # Andradina
        (-20.444077, -49.888058, 10), # Votuporanga
        (-20.271937, -50.528508, 10), # Jales
        (-20.852554, -49.392951, 10), # Sõa josé do rio preto
        (-21.795118, -48.157758, 10), # Araraquara
        (-21.195181, -47.796523, 10), # Ribeirão Preto
        (-20.734218, -47.606209, 10), # Franca
        (-20.714987, -47.839115, 10), # Nuporanga
        (-20.320873, -47.784991, 10), # Ituverava
        (-23.454223, -48.218085, 10), # Angatuba
        (-23.714574, -48.885557, 10), # Caputera
        (-24.399796, -47.919463, 10), # Sete Barras
        (-24.339647, -47.630086, 10), # Juquiá
        (-23.508517, -47.458066, 10), # Sorocaba
        (-23.235026, -47.284847, 10), # Itu
        (-23.230782, -47.518116, 10), # Porto Feliz
        (-23.605905, -48.040083, 10), # Itapetininga
        (-23.118058, -48.923121, 10), # Avaré
        (-23.470558, -48.723879, 10), # Paranapanema
        (-23.543839, -48.253009, 10), # Tupy
        (-23.286270, -47.649788, 10), # Boituva
        (-23.114322, -47.714457, 10), # Tietê
        (-23.176971, -47.297576, 10), # Salto
        (-23.540601, -47.137059, 10), # São Roque
        (-22.912127, -48.442567, 10), # Botucatu
        (-22.571432, -48.820222, 10), # Lençóis Paulista
        (-23.012020, -48.692506, 10), # Lobo
        (-22.327741, -51.556758, 10), # Tarabai
        (-21.917537, -50.504126, 10), # Tupã
        (-21.198649, -50.873130, 10), # Valparaiso
        (-23.066406, -49.628449, 10), # Ipaussu
        (-23.215078, -49.378580, 10), # Piraju
        (-22.009009, -49.439293, 10), # Pirajui
        (-21.911744, -49.017851, 10), # Iacanga
        (-22.469208, -49.276154, 10), # Cabrália
        (-21.106491, -48.970244, 10), # Catanduva
        (-20.953432, -48.482920, 10), # Bebedouro
        (-20.540908, -48.572994, 10), # Barretos
        (-21.961536, -47.896284, 10), # São Carlos
        (-21.459670, -47.573759, 10), # São simão
        (-21.228461, -48.321731, 10), # Jaboticabal
        (-21.025855, -48.163318, 10), # Pontal
        (-21.316729, -47.725640, 10), # Cravinhos
        (-22.498591, -50.907157, 10), # Agissé
        (-21.097495, -51.059436, 10), # Jequitaia
        (-21.008684, -51.192472, 10), # Guaraçaí
        (-20.966978, -51.251707, 10), # Murutinga
        (-21.590260, -48.440909, 10), # Matão
        (-21.428029, -48.520590, 10), # Taquaritinga
        (-21.867028, -50.692760, 10), # Bastps
        (-21.663258, -51.092320, 10), # Adamantina
        (-21.234420, -50.640574, 10), # Guararapes
        (-20.384117, -50.758159, 10), # Palmeiras d'oeste
        (-20.486912, -49.789143, 10), # Cosmorama
        (-20.761964, -49.704751, 10), # Monte Aprazivel
        (-20.727002, -49.577056, 10), # Bálsamo
        (-22.812265, -50.061348, 10), # Ibirarema
        (-22.777766, -50.207947, 10), # Palmital
        (-22.608535, -50.662797, 10), # Maracaí
        (-23.202030, -49.602246, 10), # Timburi
        (-22.345948, -48.760333, 10), # Pederneiras
        (-22.282964, -48.549548, 10), # Jaú
        (-22.314215, -48.894127, 10), # Guaianás
        (-22.140731, -51.165771, 10), # Martinópolis
        (-22.063030, -51.096631, 10), # Vila martins
        (-22.007178, -51.237835, 10), # Caiabu
        (-20.351123, -50.180025, 10), # Meridiano
        (-20.281957, -50.392947, 10), # Estrela d'oeste
        (-20.363621, -50.695395, 10), # São Francisco
        (-20.620964, -49.335646, 10), # Onda verde
        (-24.067513, -49.077175, 10), # Maia
        (-24.004971, -48.952315, 10), # Itapeva
        (-23.117676, -47.372972, 10), # Três Cruzes
        (-21.989257, -47.914127, 10), # São Carlos
        (-21.896615, -48.067726, 10), # Ibatê
        (-21.595677, -48.074593, 10), # Rincao
        (-24.557000, -47.865553, 10), # Vila da palha
        (-24.546718, -47.790761, 10), # Jardim Paulistano
        (-24.046689, -48.847326, 10), # Engenho velho
        (-23.976949, -48.888932, 10), # Itapeva
        (-20.593757, -47.618177, 10), # São josé da bela vista
        (-20.671669, -47.714536, 10), # Dourados
        (-21.145522, -47.990908, 10), # Sertãozinho
        (-20.995077, -48.326030, 10), # Ibitiúva
        (-21.038880, -49.103669, 10), # Japurá
        (-21.365441, -48.741731, 10), # Agulha
        (-21.274144, -48.860084, 10), # Santa Adélia
        (-23.569953, -47.856923, 10), # Alambari
        (-23.494701, -47.743241, 10), # Capela do alto
        (-23.741932, -48.510989, 10), # Barreiro
        (-23.683187, -48.294082, 10), # Varginha
        (-23.611894, -48.028919, 10), # Itapetininga
        (-22.750276, -48.579296, 10), # São manuel
        (-22.768764, -48.921374, 10), # São manuel 2
        (-21.587149, -50.597963, 10), # Piacatu
        (-21.407316, -50.473436, 10), # Bilac
        (-21.245166, -50.646102, 10), # Guararapes
        (-24.586982, -49.198590, 5), # Itapirapua paulista
        (-24.483090, -49.013444, 5), # Barra do chápeu
        (-22.433475, -51.749898, 5), # Sandovalina
        (-22.492253, -52.227636, 5), # Lajeadinho
        (-21.695325, -49.739089, 10), # Lins
        (-21.616082, -49.796272, 10), # Guaiçara
        (-21.544322, -49.852541, 10), # Promissão
        (-21.413236, -49.776975, 10), # Dinisia
        (-21.454419, -49.573841, 10), # Sabino
        (-21.348951, -49.507404, 10), # Sales
        (-21.230487, -49.640279, 10), # Adolfo
        (-21.276370, -49.401294, 10), # Irapua
        (-21.175677, -49.572408, 10), # Mendonça
        (-20.987074, -48.920689, 10), # Novais
        (-21.010917, -48.773036, 10), # Paraiso
        (-20.921603, -48.640549, 10), # Monte azul
        (-20.394064, -50.029986, 10), # Votuporanga 2
        (-20.295023, -50.249585, 10), # Fernandopolis
        (-20.920103, -49.269761, 10), # Cedral
        (-20.927001, -49.447656, 10), # Bady
        (-21.040800, -49.376438, 10), # Potirendaba
        (-20.742568, -48.896037, 10), # Jardim Snata efigenia
        (-20.693129, -49.067518, 10), # Baguaçu
        (-20.536710, -49.720947, 10), # Ecatu
        (-20.612465, -49.649445, 10), # Tanabi
        (-20.448549, -49.893874, 10), #Simonsen
        (-24.488617, -47.834741, 10), # Registro 2
        (-22.875648, -49.981843, 10), # Salto grande
        (-22.908743, -49.624756, 10), # Santa Cruz do Rio Pardo
        (-21.886089, -50.946116, 10), # Sagres
        (-24.661043, -47.972466, 10), # Jacupiranga
    ]
    
    lat_list, lon_list, valores_list = [], [], []
    
    for lat_c, lon_c, n_pts in clusters:
        # Gerar uma grade determinística de pontos ao redor do centro do cluster.
        # Isso mantém a precisão (sem aleatoriedade) mas espalha pontos para que
        # o heatmap seja visível (não fica tudo empilhado em um único pixel).
        # Ajuste `spread_deg` para controlar o tamanho do espalhamento.
        spread_deg = 0.008  # equivalente a ~800m; ajuste conforme necessidade

        # Determinar tamanho de grade (nx * ny >= n_pts)
        nx = int(np.ceil(np.sqrt(n_pts)))
        ny = int(np.ceil(n_pts / nx))

        # Gerar offsets em uma grade centrada no ponto
        x_offsets = np.linspace(-spread_deg/2, spread_deg/2, nx)
        y_offsets = np.linspace(-spread_deg/2, spread_deg/2, ny)
        xv, yv = np.meshgrid(x_offsets, y_offsets)
        xv = xv.ravel()[:n_pts]
        yv = yv.ravel()[:n_pts]

        lat = lat_c + yv
        lon = lon_c + xv

        # Atribuir um valor determinístico por cluster (intensidade relativa).
        # Aqui usamos n_pts/300.0 como escala — troque por 1.0 se preferir.
        valores = np.full(n_pts, float(n_pts) / 300.0)

        lat_list.extend(lat.tolist())
        lon_list.extend(lon.tolist())
        valores_list.extend(valores.tolist())
    
    # Exemplo 2: Mapa interativo (Folium)
    print("\nExemplo 2: Mapa Interativo com Folium")
    
    # Amostragem determinística para o mapa interativo: escolher 100 pontos
    # uniformemente espaçados pela lista para cobrir melhor toda a área.
    total = len(lat_list)
    n_select = min(100, total)
    if total == 0:
        lat_sample, lon_sample, val_sample = [], [], []
    else:
        indices = np.linspace(0, total - 1, n_select, dtype=int)
        lat_sample = [lat_list[i] for i in indices]
        lon_sample = [lon_list[i] for i in indices]
        val_sample = [valores_list[i] for i in indices]
    
    gerador.criar_mapa_interativo_folium(
        lat_sample, lon_sample, val_sample,
        centro_lat=-22.55,
        centro_lon=-48.63,
        zoom_inicial=7,
        nome_arquivo='mapa_calor_sao_paulo.html'
    )
    
    
    print("\n✓ Todos os mapas foram gerados!")
    print("\nDicas de uso:")
    print("- Ajuste alpha_heatmap (0-1) para controlar transparência")