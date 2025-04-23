
const sequencerConfig = {
  blocksCount: 4,

  rows: [
    { id: 'rh', enabled: true, label: 'Right Hand', limb: 'RH' },          
    { id: 'lh', enabled: true, label: 'Left Hand', limb: 'LH' },            
    { id: 'rf', enabled: true, label: 'Right Foot', limb: 'RF' },
    { id: 'lf', enabled: true, label: 'Left Foot', limb: 'LF' }
  ],

  cellsPerRow: [
    { rh:4, lh:4, rf:4, lf:4, showMuteButtons: true }, // блок 1
    { rh:4, lh:4, rf:4, lf:4, showMuteButtons: true }, // блок 2
    { rh:4, lh:4, rf:4, lf:4, showMuteButtons: true }, // блок 3
    { rh:4, lh:4, rf:4, lf:4, showMuteButtons: true }  // блок 4
  ]
};

// Глобальный объект состояний muted по limb-коду:
const mutedLimbs = {};
// Инициализация sequencerData (вне генератора отдельно)
const sequencerData = {};

// Инициализируем пустой структурой перед запуском генератора:
function initSequencerData(config){
  // Если ранее не было данных, создаём полностью пустой объект для хранения блоков:
  if(typeof sequencerData === 'undefined' || sequencerData === null){
    window.sequencerData = {};
  }

  const { blocksCount, rows, cellsPerRow } = config;

  // Удаляем блоки с конца, если они есть и стали лишними
  Object.keys(sequencerData).forEach(blockIndex => {
    if(blockIndex >= blocksCount){
      delete sequencerData[blockIndex];  
    }
  });

  // Проходим по всем необходимым блокам (для актуального конфигурации)
  for(let b = 0; b < blocksCount; b++){
    if(!sequencerData[b]){ 
      sequencerData[b] = {}; 
    }

    rows.forEach(row => {
      const rowId = row.id;
      const cellsCount = cellsPerRow[b][rowId] || 4;

      if(!sequencerData[b][rowId]){
        sequencerData[b][rowId] = Array(cellsCount).fill(null);  
      } else {
        // Существующие ряды проверяем по длине (если вдруг поменялось количество шагов в ряду – расширяем или сужаем)
        const currentRow = sequencerData[b][rowId];
        if(currentRow.length !== cellsCount){
          if(currentRow.length > cellsCount)
            sequencerData[b][rowId] = currentRow.slice(0, cellsCount);
          else{
            sequencerData[b][rowId].push(...Array(cellsCount - currentRow.length).fill(null));
          }
        }        
      }
    });

    // Удалим ряды, которых больше нет в конфиге
    Object.keys(sequencerData[b]).forEach(rowId => {
      if(!rows.find(r => r.id === rowId)){
        delete sequencerData[b][rowId];
      }
    });
  }
}


// Создание ячейки
function createCell(blockIndex,rowId,cellIndex){
  const cell = document.createElement('div');
  cell.classList.add('cell');
  cell.dataset.block = blockIndex;
  cell.dataset.row = rowId;
  cell.dataset.cell = cellIndex;

  cell.onclick = function(){
    if(activeInstrumentId === null) return; // если админ не выбрал инструмент
    const limbCode = cell.closest('.cells-row').dataset.limb; 
    const instrument = instruments.find(i=>i.id===activeInstrumentId);

    // Проверяем подходит ли инструмент по limb:
    if (!instrument.limbs.includes(limbCode)) {
      // shake-эффект для ячейки
      cell.classList.add('shake');
    
      // Убираем класс shake через 400 мс (как длительность CSS-анимации)
      setTimeout(() => cell.classList.remove('shake'), 400);
    
      return;
    }
    

    const block = cell.dataset.block;
    const row = cell.dataset.row;
    const cellIdx = cell.dataset.cell;

    const currentInstrId = sequencerData[block][row][cellIdx];

    // Если тот же инструмент уже стоит - очищаем:
    if(currentInstrId === activeInstrumentId){
      sequencerData[block][row][cellIdx] = null;
    }else{
      sequencerData[block][row][cellIdx] = activeInstrumentId;
    }

    renderSequencerCells(); // обновляем все визуальные иконки
  };

  return cell;
}


// Функция создания ряда с учетом кнопок (визуализация)
function createRow(blockIndex, rowId, cellsCount, limbCode, showMute) {
  const row = document.createElement('div');
  row.classList.add('cells-row', `row-${rowId}`);
  row.dataset.limb = limbCode;
  row.style.setProperty('--cells-count', cellsCount);

  if (showMute) {
    const muteBtn = document.createElement('button');
    muteBtn.classList.add('mute-button');
    muteBtn.textContent = limbCode;
    muteBtn.dataset.limb = limbCode;

    muteBtn.onclick = function() {
      mutedLimbs[limbCode] = !mutedLimbs[limbCode];
      updateMutedState();
    };

    row.appendChild(muteBtn);
  }

  const cellsContainer = document.createElement('div');
  cellsContainer.classList.add('cells-container');

  for (let i = 0; i < cellsCount; i++) {
    cellsContainer.appendChild(createCell(blockIndex, rowId, i));
  }
  
  

  row.appendChild(cellsContainer);
  return row;
}

let currentLoopBlockIndex = null;

// Создание блока
function createBlock(blockCellsConfig, globalRowsConfig, blockIndex){
  const block = document.createElement('div');
  block.classList.add('block');
  block.dataset.blockIndex = blockIndex;

  // новая кнопка Loop сверху блока
  const loopBtn = document.createElement('button');
  loopBtn.classList.add('loop-button');
  loopBtn.textContent = `Loop ${blockIndex + 1}`;
  loopBtn.onclick = function(){
    currentLoopBlockIndex = (currentLoopBlockIndex === blockIndex) ? null : blockIndex;
    updateLoopView(); // Обновляем визуально
  };
  block.appendChild(loopBtn); // добавляем её в блок сверху

  const rowsContainer = document.createElement('div');
  rowsContainer.classList.add('rows-container');

  const showMuteButtons = (blockCellsConfig.showMuteButtons !== undefined)
                          ? blockCellsConfig.showMuteButtons
                          : true; // по умолчанию true

  globalRowsConfig.forEach(({id, enabled, limb})=>{
    if(enabled){
      rowsContainer.appendChild(createRow(
        blockIndex,
        id, 
        blockCellsConfig[id], 
        limb, 
        showMuteButtons
      ));
    }
  });

  block.appendChild(rowsContainer);
  return block;
}

// Добавляем функцию обновления отображения loop-кнопок
function updateLoopView(){
  document.querySelectorAll('.block').forEach(elem => {
    const blockIdx = parseInt(elem.dataset.blockIndex, 10);
    if(blockIdx === currentLoopBlockIndex){
      elem.classList.add('loop'); // Именно этот класс используется логикой плеера
      elem.querySelector('.loop-button').classList.add('active');
    } else {
      elem.classList.remove('loop');
      elem.querySelector('.loop-button').classList.remove('active');
    }
  });
}



// Чёткое и простое обновление mute-состояния визуально:
function updateMutedState(){
  document.querySelectorAll('.cells-row').forEach(row=>{
    const limb = row.dataset.limb;
    if (mutedLimbs[limb]) {
      row.classList.add('muted');
    } else {
      row.classList.remove('muted');
    }
  });

  // отдельно обновляем кнопки:
  document.querySelectorAll('.mute-button').forEach(btn=>{
    const limb = btn.dataset.limb;
    if (mutedLimbs[limb]) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}


// Генерация секвенсора:
function generateSequencer(config){
  const container = document.getElementById('sequencer');
  container.innerHTML = '';

  const {blocksCount, rows, cellsPerRow} = config;

  for(let i=0; i<blocksCount; i++){
    const blockConfig = cellsPerRow[i] || {};
    rows.forEach(r=>{
      if(blockConfig[r.id] === undefined) blockConfig[r.id]=4;
    });

    container.appendChild(createBlock(blockConfig, rows, i)); // <-- ПЕРЕДАЛИ INDEX!
  }

  updateMutedState();
  updateLoopView(); // <-- сразу вызвали первоначальную визуализацию
}

function updateLoopView(){
  document.querySelectorAll('.block').forEach(block=>{
    const blockIndex = +block.dataset.blockIndex;
    const shouldShow = (currentLoopBlockIndex === null || currentLoopBlockIndex === blockIndex);
    block.style.display = shouldShow ? 'block':'none';
    block.querySelector('.loop-button').classList.toggle('active', blockIndex === currentLoopBlockIndex);
  });
}

function renderSequencerCells(){
  document.querySelectorAll('.cell').forEach(cell => {
    const block = cell.dataset.block;
    const row = cell.dataset.row;
    const cellIdx = cell.dataset.cell;
    const instrId = sequencerData[block][row][cellIdx];

    // очищаем старое
    cell.innerHTML = '';

    if(instrId){
      const instr = instruments.find(i=>i.id===instrId);
      if(instr){
        const img = document.createElement('img');
        img.src = instr.imageUrl;
        img.classList.add('cell-instrument');
        cell.appendChild(img);
      }
    }
  });
}

// вызываем renderSequencerCells при перерисовке генератора:
initSequencerData(sequencerConfig);
generateSequencer(sequencerConfig);
renderSequencerCells();
