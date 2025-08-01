document.addEventListener('DOMContentLoaded', () => {
    const stationSelector = document.getElementById('station-selector');
    const comparisonStationSelector = document.getElementById('comparison-station-selector');
    const timeRangeStationSelector = document.getElementById('time-range-station-selector');
    const analysisStationSelector = document.getElementById('analysis-station-selector');
    const upstreamStationSelector = document.getElementById('upstream-station-selector');
    const downstreamStationSelector = document.getElementById('downstream-station-selector');


    const stationName = document.getElementById('station-name');
    const stationDate = document.getElementById('station-date');
    const stationValue = document.getElementById('station-value');
    const stationPrevValue = document.getElementById('station-prev-value');
    const stationTendency = document.getElementById('station-tendency');
    const stationState = document.getElementById('station-state');
    const stationDistrito = document.getElementById('station-distrito');
    const stationPais = document.getElementById('station-pais');
    const stationTipoNombre = document.getElementById('station-tipo-nombre');
    const stationPropietario = document.getElementById('station-propietario');
    const stationRio = document.getElementById('station-rio');
    const stationCeroIgn = document.getElementById('station-cero-ign');
    const nivelAlerta = document.getElementById('nivel-alerta');
    const nivelEvacuacion = document.getElementById('nivel-evacuacion');
    const nivelAguasBajas = document.getElementById('nivel-aguas-bajas');


    const errorMessage = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');

    const tabs = {
        detail: {
            btn: document.getElementById('tab-btn-detail'),
            content: document.getElementById('tab-content-detail'),
        },
        comparison: {
            btn: document.getElementById('tab-btn-comparison'),
            content: document.getElementById('tab-content-comparison'),
        },
        timeRangeComparison: {
            btn: document.getElementById('tab-btn-time-range-comparison'),
            content: document.getElementById('tab-content-time-range-comparison'),
        },
        analysis: {
            btn: document.getElementById('tab-btn-analysis'),
            content: document.getElementById('tab-content-analysis'),
        }
    };

    let timeSeriesChart = null;
    let comparisonChart = null;
    let timeRangeComparisonChart = null;
    let analysisChart = null;
    let stationsData = [];

    // Función para mostrar errores
    const showError = (message) => {
        errorText.textContent = message;
        errorMessage.classList.remove('hidden');
    };

    // Función para ocultar errores
    const hideError = () => {
        errorMessage.classList.add('hidden');
    };

    // Función para manejar las pestañas
    const handleTabClick = (tabKey) => {
        // Desactivar todas las pestañas
        for (const key in tabs) {
            tabs[key].btn.classList.remove('active');
            tabs[key].content.classList.remove('active');
        }
        // Activar la pestaña seleccionada
        tabs[tabKey].btn.classList.add('active');
        tabs[tabKey].content.classList.add('active');
    };

    // Añadir event listeners a los botones de las pestañas
    for (const key in tabs) {
        tabs[key].btn.addEventListener('click', () => handleTabClick(key));
    }


    // Función para cargar las estaciones
    const loadStations = async () => {
        try {
            const response = await fetch('https://alerta.ina.gob.ar/a5/mapa/estado_diario_json/');
            if (!response.ok) {
                throw new Error('Error al cargar los datos de las estaciones.');
            }
            stationsData = await response.json();
            populateStationSelectors(stationsData);
        } catch (error) {
            showError(error.message);
            console.error(error);
        }
    };

    // Función para popular los selectores de estaciones
    const populateStationSelectors = (stations) => {
        const selectors = [
            stationSelector,
            comparisonStationSelector,
            timeRangeStationSelector,
            analysisStationSelector,
            upstreamStationSelector,
            downstreamStationSelector
        ];

        selectors.forEach(selector => {
            if (selector) {
                selector.innerHTML = '';
                if (selector.id === "station-selector") {
                    const defaultOption = document.createElement('option');
                    defaultOption.value = "";
                    defaultOption.textContent = "Seleccione una estación";
                    selector.appendChild(defaultOption);
                }

                stations.forEach(station => {
                    const option = document.createElement('option');
                    option.value = station.id;
                    option.textContent = `${station.nombre} (${station.rio})`;
                    selector.appendChild(option);
                });
            }
        });
    };
    
    // Función para obtener y mostrar los datos de una estación
    const getStationData = async (stationId) => {
        if (!stationId) {
            // Restablecer la información si no hay estación seleccionada
            stationName.textContent = 'Selecciona una estación';
            stationDate.textContent = '';
            stationValue.textContent = '';
            stationPrevValue.textContent = '';
            stationTendency.textContent = '';
            stationState.textContent = '';
            stationDistrito.textContent = '';
            stationPais.textContent = '';
            stationTipoNombre.textContent = '';
            stationPropietario.textContent = '';
            stationRio.textContent = '';
            stationCeroIgn.textContent = '';
            nivelAlerta.textContent = '';
            nivelEvacuacion.textContent = '';
            nivelAguasBajas.textContent = '';

            if (timeSeriesChart) {
                timeSeriesChart.destroy();
                timeSeriesChart = null;
            }
            return;
        }

        try {
            hideError();
            const station = stationsData.find(s => s.id == stationId);
            
            // Actualizar la información de la estación
            stationName.textContent = station.nombre || 'No disponible';
            stationDate.textContent = station.fecha || 'No disponible';
            stationValue.textContent = station.valor ? `${station.valor} m` : 'No disponible';
            stationPrevValue.textContent = station.valor_precedente ? `${station.valor_precedente} m` : 'No disponible';
            
            // Lógica para la tendencia
            let tendencyText = 'Estable';
            let tendencyClass = 'text-gray-600';
            if (station.tendencia === 1) {
                tendencyText = 'En alza';
                tendencyClass = 'text-red-600';
            } else if (station.tendencia === -1) {
                tendencyText = 'En baja';
                tendencyClass = 'text-green-600';
            }
            stationTendency.textContent = tendencyText;
            stationTendency.className = `font-semibold ${tendencyClass}`;
    
            stationState.textContent = station.estado || 'No disponible';
            stationDistrito.textContent = station.distrito || 'No disponible';
            stationPais.textContent = station.pais || 'No disponible';
            stationTipoNombre.textContent = station.tipo_nombre || 'No disponible';
            stationPropietario.textContent = station.propietario || 'No disponible';
            stationRio.textContent = station.rio || 'No disponible';
            stationCeroIgn.textContent = station.cero_ign ? `${station.cero_ign} m` : 'No disponible';
            nivelAlerta.textContent = station.nivel_alerta ? `${station.nivel_alerta} m` : 'No disponible';
            nivelEvacuacion.textContent = station.nivel_evacuacion ? `${station.nivel_evacuacion} m` : 'No disponible';
            nivelAguasBajas.textContent = station.nivel_aguas_bajas ? `${station.nivel_aguas_bajas} m` : 'No disponible';

            // Cargar y mostrar el gráfico de series de tiempo
            await loadTimeSeriesChart(stationId, station.cero_ign);

        } catch (error) {
            showError('No se pudo cargar la información de la estación.');
            console.error(error);
        }
    };

    // Función para cargar el gráfico de series de tiempo
    const loadTimeSeriesChart = async (stationId, ceroIgn) => {
        try {
            const response = await fetch(`https://alerta.ina.gob.ar/a5/series/series_json/?id_estacion=${stationId}&default_callback=1`);
            if (!response.ok) {
                throw new Error('Error al cargar la serie de tiempo.');
            }
            const data = await response.json();
            
            const labels = data.map(d => new Date(d.fecha_hora).toLocaleString());
            const values = data.map(d => parseFloat(d.valor));

            if (timeSeriesChart) {
                timeSeriesChart.destroy();
            }

            const ctx = document.getElementById('timeSeriesChart').getContext('2d');
            timeSeriesChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Nivel del Agua (m)',
                        data: values,
                        borderColor: 'rgba(54, 162, 235, 1)',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderWidth: 2,
                        pointRadius: 2,
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Fecha y Hora'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Nivel (m)'
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: true
                        },
                        title: {
                            display: true,
                            text: `Serie de Tiempo para la Estación (Nivel sobre Cero de la Escala)`
                        },
                        zoom: {
                            pan: {
                                enabled: true,
                                mode: 'xy'
                            },
                            zoom: {
                                wheel: {
                                    enabled: true,
                                },
                                pinch: {
                                    enabled: true
                                },
                                mode: 'xy',
                            }
                        }
                    }
                }
            });

        } catch (error) {
            showError('No se pudo cargar el gráfico de la serie de tiempo.');
            console.error(error);
        }
    };


    // Event Listeners
    stationSelector.addEventListener('change', (e) => {
        getStationData(e.target.value);
    });

    // Carga inicial
    loadStations();
});
