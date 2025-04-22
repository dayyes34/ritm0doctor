const sequencerConfig = {
    blocksCount: 4, // сколько блоков отображаем?
  
    rows: [          // глобальные настройки рядов
      { id: 'rh', enabled: true, label: 'Right Hand' },          
      { id: 'lh', enabled: true, label: 'Left Hand' },            
      { id: 'rf', enabled: true, label: 'Right Foot' },
      { id: 'lf', enabled: true, label: 'Left Foot' }
    ],
  
    cellsPerRow: [   // Количество ячеек по отдельным блокам (каждый блок - отдельный объект)
      // rh, lh, rf, lf (порядок из массива rows выше)
      { rh:4, lh:4, rf:4, lf:4 }, // блок 1
      { rh:4, lh:4, rf:4, lf:4 }, // блок 2
      { rh:4, lh:4, rf:4, lf:4 }, // блок 3
      { rh:4, lh:4, rf:4, lf:4 }  // блок 4
    ]
  };  

// одна ячейка
function createCell(){
    const cell = document.createElement('div');
    cell.classList.add('cell');
    return cell;
  }
  
  // ряд
  function createRow(rowId, cellsCount, limbCode) {
  const row = document.createElement('div');
  row.classList.add('cells-row', `row-${rowId}`);
  row.dataset.limb = limbCode; // <-- привязали ряд к конечности
  row.style.setProperty('--cells-count', cellsCount);

  // создаём сами ячейки
  for(let i=0; i<cellsCount; i++){
    row.appendChild(createCell());
  }

  // центрируем для менее чем 4 ячеек
  if (cellsCount < 4) {
    row.style.display = 'flex';
    row.style.justifyContent = 'center';
    row.style.gap = '5px';
    row.querySelectorAll('.cell').forEach(cell => {
      cell.style.width = '35px';
      cell.style.flexShrink = '0';
    });
  }

  return row;
}

  
  // целый блок (учитывает rows global-config)
  function createBlock(blockCellsConfig, globalRowsConfig){
    const block = document.createElement('div');
    block.classList.add('block');
  
    globalRowsConfig.forEach(({id, enabled, limb}) => { // <-- получили limb тут
      if(enabled){
        block.appendChild(createRow(id, blockCellsConfig[id], limb)); // <-- передаем limb
      }
    });
  
    return block;
  }
  
  
  // генерация всего экрана
  function generateSequencer(sequencerConfig){
    const container=document.getElementById('sequencer');
    container.innerHTML='';
  
    const {blocksCount, rows, cellsPerRow}=sequencerConfig;
  
    for(let i=0;i<blocksCount;i++){
      const blockConfig = cellsPerRow[i] || {};
      rows.forEach(r=>{
        if(blockConfig[r.id]===undefined) blockConfig[r.id]=4;
      });
  
      container.appendChild(createBlock(blockConfig, rows));
    }
  }
  
  
  // 👇 Запускаем легко и красиво:
  generateSequencer(sequencerConfig);
  