// ui-controls.js
document.addEventListener("DOMContentLoaded", () => {

    const controls = document.getElementById('controls');
    if (!controls) return;

    const blocksSelect = document.getElementById('block-count');
    const rowsContainer = document.getElementById('row-toggles');

    // Инициализация элементов управления
    initBlocksSelect(blocksSelect);
    initRowToggles(rowsContainer);

    // Первичная генерация для синхронизации
    generateSequencer(sequencerConfig);

    // Подписка на изменения
    blocksSelect.addEventListener('change', applyChanges);
    rowsContainer.addEventListener('change', applyChanges);
});

function initBlocksSelect(selectElem) {
    for (let i = 1; i <= 6; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        if (sequencerConfig.blocksCount === i) option.selected = true;
        selectElem.appendChild(option);
    }
}

function initRowToggles(container) {
    sequencerConfig.rows.forEach(row => {
        const label = document.createElement('label');
        label.innerHTML = `
            <input type="checkbox" data-row="${row.id}" ${row.enabled ? 'checked' : ''}>
            ${row.label}
        `;
        container.appendChild(label);
    });
}

// Мгновенное применение изменений
function applyChanges() {
    const selectedBlocksCount = +document.getElementById('block-count').value;
    sequencerConfig.blocksCount = selectedBlocksCount;

    document.querySelectorAll('#row-toggles input').forEach(checkbox => {
        const row = sequencerConfig.rows.find(r => r.id === checkbox.dataset.row);
        row.enabled = checkbox.checked;
    });

    // Коррекция массива блоков
    while (sequencerConfig.cellsPerRow.length < sequencerConfig.blocksCount) {
        sequencerConfig.cellsPerRow.push({ rh:4, lh:4, rf:4, lf:4 });
    }
    sequencerConfig.cellsPerRow.length = sequencerConfig.blocksCount;

    generateSequencer(sequencerConfig);
}
