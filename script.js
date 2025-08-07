console.log("🚀 script.js実行開始");

// ========================================
// I. CONFIGURATION & CONSTANTS
// ========================================

// 性格データ
const natureDataList = [
    { "name": "ひかえめ", "c": 1.1, "a": 0.9 },
    { "name": "おくびょう", "s": 1.1, "a": 0.9 },
    { "name": "いじっぱり", "a": 1.1, "c": 0.9 },
    { "name": "ようき", "s": 1.1, "c": 0.9 },
    { "name": "ずぶとい", "b": 1.1, "a": 0.9 },
    { "name": "おだやか", "d": 1.1, "a": 0.9 },
    { "name": "わんぱく", "b": 1.1, "c": 0.9 },
    { "name": "しんちょう", "d": 1.1, "c": 0.9 },
    { "name": "れいせい", "c": 1.1, "s": 0.9 },
    { "name": "ゆうかん", "a": 1.1, "s": 0.9 },
    { "name": "なまいき", "d": 1.1, "s": 0.9 },
    { "name": "むじゃき", "s": 1.1, "d": 0.9 },
    { "name": "せっかち", "s": 1.1, "b": 0.9 },
    { "name": "さみしがり", "a": 1.1, "b": 0.9 },
    { "name": "やんちゃ", "a": 1.1, "d": 0.9 },
    { "name": "のうてんき", "b": 1.1, "d": 0.9 },
    { "name": "のんき", "b": 1.1, "s": 0.9 },
    { "name": "おっとり", "c": 1.1, "b": 0.9 },
    { "name": "うっかりや", "c": 1.1, "d": 0.9 },
    { "name": "おとなしい", "d": 1.1, "b": 0.9 },
    { "name": "まじめ", "a": 1.0, "b": 1.0, "c": 1.0, "d": 1.0, "s": 1.0 },
    { "name": "てれや", "a": 1.0, "b": 1.0, "c": 1.0, "d": 1.0, "s": 1.0 },
    { "name": "がんばりや", "a": 1.0, "b": 1.0, "c": 1.0, "d": 1.0, "s": 1.0 },
    { "name": "すなお", "a": 1.0, "b": 1.0, "c": 1.0, "d": 1.0, "s": 1.0 },
    { "name": "きまぐれ", "a": 1.0, "b": 1.0, "c": 1.0, "d": 1.0, "s": 1.0 }
];

// ========================================
// II. STATE MANAGEMENT
// ========================================

// データ格納用
let allPokemonData = [];
let moveData = [];
let itemData = [];
let typeMultiplierData = {};
let natureData = [];

// ポケモンの状態管理
let attackerPokemon = {
    name: "",
    baseStats: { hp: 0, a: 0, b: 0, c: 0, d: 0, s: 0 },
    ivValues: { hp: 31, a: 31, b: 31, c: 31, d: 31, s: 31 },
    evValues: { hp: 0, a: 0, b: 0, c: 0, d: 0, s: 0 },
    natureModifiers: { a: 1.0, b: 1.0, c: 1.0, d: 1.0, s: 1.0 },
    level: 50,
    types: [],
    item: null
};

let defenderPokemon = {
    name: "",
    baseStats: { hp: 0, a: 0, b: 0, c: 0, d: 0, s: 0 },
    ivValues: { hp: 31, a: 31, b: 31, c: 31, d: 31, s: 31 },
    evValues: { hp: 0, a: 0, b: 0, c: 0, d: 0, s: 0 },
    natureModifiers: { a: 1.0, b: 1.0, c: 1.0, d: 1.0, s: 1.0 },
    level: 50,
    types: [],
    item: null
};

// 現在選択されている技
let currentMove = null;

// ダメージ履歴
let damageHistory = [];

// 複数ターンの技を管理する配列（最初の技も含めて5つ）
let multiTurnMoves = [null, null, null, null, null]; // 0: 1ターン目の技(通常の技欄), 1-4: 2-5ターン目

// ========================================
// III. INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    initializeApplication();
});

async function initializeApplication() {
    await loadAllData();
    setupEventListeners();
    restoreInputValuesOnLoad();
}

/**
 * データを読み込む
 */
async function loadAllData() {
    try {
        // 全ポケモンデータ
        const pokemonResponse = await fetch('all_pokemon_data.json');
        allPokemonData = await pokemonResponse.json();
        
        // 技データ
        const moveResponse = await fetch('pokemon_moves.json');
        moveData = await moveResponse.json();
        
        // アイテムデータ
        const itemResponse = await fetch('item.json');
        itemData = await itemResponse.json();
        
        // タイプ相性データ
        const typeResponse = await fetch('type_multiplier.json');
        typeMultiplierData = await typeResponse.json();
        
        // ドロップダウンの初期化
        initializeDropdownsWithNature();
        
    } catch (error) {
        console.error('データ読み込みエラー:', error);
    }
}

/**
 * 入力値復元機能
 */
function restoreInputValuesOnLoad() {
    // ポケモン名の復元
    restorePokemonSelection();
    
    // レベルの復元
    restoreLevels();
    
    // 個体値・努力値の復元
    restoreIVEVValues();
    
    // 性格の復元
    restoreNatureSelection();
    
    // アイテムの復元
    restoreItemSelection();
    
    // 技の復元
    restoreMoveSelection();
    
    // 複数ターン技の復元
    restoreMultiTurnMoves();
    
    // 実数値の同期（最後に実行）
    restoreRealStatValues();
    
    // ステータス計算を実行
    if (attackerPokemon.name) {
        updateStats('attacker');
    }
    if (defenderPokemon.name) {
        updateStats('defender');
    }
    
    // ボタンの表示を更新
    updateAllButtons();
    
    // 詳細設定の表示更新
    updateDetailSummary('attacker');
    updateDetailSummary('defender');
}

/**
 * 性格選択処理
 */
function selectNature(side) {
    const inputId = side === 'attacker' ? 'attackerNature' : 'defenderNature';
    const selectedNature = document.getElementById(inputId).value;
    const nature = natureData.find(n => n.name === selectedNature);
    
    const target = side === 'attacker' ? attackerPokemon : defenderPokemon;
    
    // 性格補正をリセット
    target.natureModifiers = { a: 1.0, b: 1.0, c: 1.0, d: 1.0, s: 1.0 };
    
    if (nature) {
        Object.keys(nature).forEach(stat => {
            if (stat !== 'name' && target.natureModifiers[stat] !== undefined) {
                target.natureModifiers[stat] = nature[stat];
            }
        });
    }
    
    // 性格チェックボックスを更新（メイン画面のボタンも含む）
    updateNatureCheckboxes(side);
    updateStats(side);
}

/**
 * ポケモン選択の復元
 */
function restorePokemonSelection() {
    const attackerInput = document.getElementById('attackerPokemon');
    const defenderInput = document.getElementById('defenderPokemon');
    
    if (attackerInput && attackerInput.value) {
        selectPokemon('attacker', attackerInput.value);
    }
    
    if (defenderInput && defenderInput.value) {
        selectPokemon('defender', defenderInput.value);
    }
}

/**
 * レベルの復元
 */
function restoreLevels() {
    const attackerLevel = document.getElementById('attackerLevel');
    const defenderLevel = document.getElementById('defenderLevel');
    
    if (attackerLevel && attackerLevel.value) {
        attackerPokemon.level = parseInt(attackerLevel.value) || 50;
    }
    
    if (defenderLevel && defenderLevel.value) {
        defenderPokemon.level = parseInt(defenderLevel.value) || 50;
    }
}

/**
 * 個体値・努力値の復元
 */
function restoreIVEVValues() {
    const stats = ['hp', 'a', 'b', 'c', 'd', 's'];
    
    // 攻撃側の復元
    stats.forEach(stat => {
        const statUpper = stat.toUpperCase();
        
        // 個体値（メイン）
        const mainIV = document.getElementById(`attackerIv${statUpper}`);
        if (mainIV && mainIV.value !== '') {
            attackerPokemon.ivValues[stat] = parseInt(mainIV.value) || 31;
        }
        
        // 個体値（詳細）
        const detailIV = document.getElementById(`attackerDetailIv${statUpper}`);
        if (detailIV && detailIV.value !== '') {
            attackerPokemon.ivValues[stat] = parseInt(detailIV.value) || 31;
            if (mainIV) mainIV.value = detailIV.value; // 同期
        }
        
        // 努力値（メイン）
        const mainEV = document.getElementById(`attackerEv${statUpper}`);
        if (mainEV && mainEV.value !== '') {
            attackerPokemon.evValues[stat] = parseInt(mainEV.value) || 0;
        }
        
        // 努力値（詳細）
        const detailEV = document.getElementById(`attackerDetailEv${statUpper}`);
        if (detailEV && detailEV.value !== '') {
            attackerPokemon.evValues[stat] = parseInt(detailEV.value) || 0;
            if (mainEV) mainEV.value = detailEV.value; // 同期
        }
    });
    
    // 防御側の復元
    stats.forEach(stat => {
        const statUpper = stat.toUpperCase();
        
        // 個体値（メイン）
        const mainIV = document.getElementById(`defenderIv${statUpper}`);
        if (mainIV && mainIV.value !== '') {
            defenderPokemon.ivValues[stat] = parseInt(mainIV.value) || 31;
        }
        
        // 個体値（詳細）
        const detailIV = document.getElementById(`defenderDetailIv${statUpper}`);
        if (detailIV && detailIV.value !== '') {
            defenderPokemon.ivValues[stat] = parseInt(detailIV.value) || 31;
            if (mainIV) mainIV.value = detailIV.value; // 同期
        }
        
        // 努力値（メイン）
        const mainEV = document.getElementById(`defenderEv${statUpper}`);
        if (mainEV && mainEV.value !== '') {
            defenderPokemon.evValues[stat] = parseInt(mainEV.value) || 0;
        }
        
        // 努力値（詳細）
        const detailEV = document.getElementById(`defenderDetailEv${statUpper}`);
        if (detailEV && detailEV.value !== '') {
            defenderPokemon.evValues[stat] = parseInt(detailEV.value) || 0;
            if (mainEV) mainEV.value = detailEV.value; // 同期
        }
    });
}

/**
 * 性格選択の復元
 */
function restoreNatureSelection() {
    const attackerNature = document.getElementById('attackerNature');
    const defenderNature = document.getElementById('defenderNature');
    
    if (attackerNature && attackerNature.value) {
        selectNature('attacker');
    }
    
    if (defenderNature && defenderNature.value) {
        selectNature('defender');
    }
    
    // 性格チェックボックスの復元
    restoreNatureCheckboxes();
}

/**
 * 性格チェックボックスの復元
 */
function restoreNatureCheckboxes() {
    const sides = ['attacker', 'defender'];
    const stats = ['a', 'b', 'c', 'd', 's'];
    
    sides.forEach(side => {
        const pokemon = side === 'attacker' ? attackerPokemon : defenderPokemon;
        
        stats.forEach(stat => {
            const plusCheckbox = document.getElementById(`${side}${stat.toUpperCase()}Plus`);
            const minusCheckbox = document.getElementById(`${side}${stat.toUpperCase()}Minus`);
            
            if (plusCheckbox && plusCheckbox.checked) {
                pokemon.natureModifiers[stat] = 1.1;
                // 他のプラス補正を解除
                stats.forEach(otherStat => {
                    if (otherStat !== stat) {
                        const otherPlusCheckbox = document.getElementById(`${side}${otherStat.toUpperCase()}Plus`);
                        if (otherPlusCheckbox && otherPlusCheckbox.checked) {
                            otherPlusCheckbox.checked = false;
                            pokemon.natureModifiers[otherStat] = pokemon.natureModifiers[otherStat] === 0.9 ? 0.9 : 1.0;
                        }
                    }
                });
            }
            
            if (minusCheckbox && minusCheckbox.checked) {
                pokemon.natureModifiers[stat] = 0.9;
                // 他のマイナス補正を解除
                stats.forEach(otherStat => {
                    if (otherStat !== stat) {
                        const otherMinusCheckbox = document.getElementById(`${side}${otherStat.toUpperCase()}Minus`);
                        if (otherMinusCheckbox && otherMinusCheckbox.checked) {
                            otherMinusCheckbox.checked = false;
                            pokemon.natureModifiers[otherStat] = pokemon.natureModifiers[otherStat] === 1.1 ? 1.1 : 1.0;
                        }
                    }
                });
            }
        });
        
        // メイン画面の性格補正ボタンも更新
        if (side === 'attacker') {
            updateMainNatureButtons(side, 'a', pokemon.natureModifiers['a']);
            updateMainNatureButtons(side, 'c', pokemon.natureModifiers['c']);
        } else {
            updateMainNatureButtons(side, 'b', pokemon.natureModifiers['b']);
            updateMainNatureButtons(side, 'd', pokemon.natureModifiers['d']);
        }
    });
}

/**
 * 全てのボタンの表示を更新
 */
function updateAllButtons() {
    // IV ボタンの初期化
    document.querySelectorAll('.iv-input').forEach(input => {
        const value = parseInt(input.value) || 31;
        const nextValue = value === 31 ? 30 : 31;
        const parent = input.parentElement;
        const button = parent.querySelector('.iv-quick-btn');
        if (button) {
            button.textContent = nextValue;
        }
    });
    
    // EV ボタンの初期化
    document.querySelectorAll('.ev-input').forEach(input => {
        const value = parseInt(input.value) || 0;
        const nextValue = value === 252 ? 0 : 252;
        const parent = input.parentElement;
        const button = parent.querySelector('.ev-quick-btn');
        if (button) {
            button.textContent = nextValue;
        }
    });
}

/**
 * ポケモン選択の核となる関数
 */
function selectPokemon(side, pokemonName) {  
    // ポケモン名が空の場合の処理
    if (!pokemonName) {
        const target = side === 'attacker' ? attackerPokemon : defenderPokemon;
        
        // ポケモンデータをリセット
        target.name = "";
        target.baseStats = { hp: 0, a: 0, b: 0, c: 0, d: 0, s: 0 };
        target.types = [];
        
        // 特性チェックボックスを非表示
        if (side === 'attacker') {
            hideAllAbilityCheckboxes(side);
        }
        
        // 入力制限をクリア
        clearRealStatInputLimits(side);
        
        updateStats(side);
        return;
    }
    
    const pokemon = allPokemonData.find(p => p.name === pokemonName);
    if (!pokemon) return;
    
    const target = side === 'attacker' ? attackerPokemon : defenderPokemon;
    
    target.name = pokemon.name;
    target.baseStats = {
        hp: pokemon.basestats[0],
        a: pokemon.basestats[1],
        b: pokemon.basestats[2],
        c: pokemon.basestats[3],
        d: pokemon.basestats[4],
        s: pokemon.basestats[5]
    };

    // ポワルンの場合は天候に応じてタイプを設定、それ以外は通常のタイプ
    if (pokemonName === 'ポワルン') {
        target.types = getCastformTypeByWeather();
    } else {
        target.types = Array.isArray(pokemon.type) ? pokemon.type : [pokemon.type];
    }
    
    updateStats(side);

    // ポケモンデータから特性を確認
    const pokemonInfo = allPokemonData.find(p => p.name === pokemonName);
    if (pokemonInfo && pokemonInfo.ability) {
        if (side === 'attacker') {
            updateAbilityCheckboxes(side, pokemonInfo.ability);
        } else {
            updateDefenderAbilityCheckboxes(pokemonInfo.ability);
        }
    } else {
        if (side === 'attacker') {
            hideAllAbilityCheckboxes(side);
        } else {
            hideAllDefenderAbilityCheckboxes();
        }
    }
    updateAllRealStatInputLimits(side);
}

/**
 * アイテム選択の復元
 */
function restoreItemSelection() {
    const attackerItem = document.getElementById('attackerItem');
    const defenderItem = document.getElementById('defenderItem');
    
    if (attackerItem && attackerItem.value) {
        selectItem('attacker', attackerItem.value);
    }
    
    if (defenderItem && defenderItem.value) {
        selectItem('defender', defenderItem.value);
    }
}

/**
 * 技選択の復元
 */
function restoreMoveSelection() {
    const attackMove = document.getElementById('attackMove');
    
    if (attackMove && attackMove.value) {
        selectMove(attackMove.value);
    }
}

/**
 * 複数ターン技の復元
 */
function restoreMultiTurnMoves() {
    for (let i = 2; i <= 5; i++) {
        const moveInput = document.getElementById(`multiTurnMove${i}`);
        if (moveInput && moveInput.value) {
            selectMultiTurnMove(i - 1, moveInput.value);
        }
    }
}

/**
 * 実数値の同期（既存の入力値がある場合）
 */
function restoreRealStatValues() {
    const sides = ['attacker', 'defender'];
    const stats = ['hp', 'a', 'b', 'c', 'd', 's'];
    
    sides.forEach(side => {
        stats.forEach(stat => {
            const statUpper = stat.toUpperCase();
            
            // メイン画面の実数値
            const mainReal = document.getElementById(`${side}Real${statUpper}`);
            if (mainReal && mainReal.value && parseInt(mainReal.value) > 0) {
                // 実数値から逆算して個体値・努力値を調整
                adjustStatsFromRealValue(side, stat, parseInt(mainReal.value));
            }
            
            // 詳細画面の実数値
            const detailReal = document.getElementById(`${side}DetailReal${statUpper}`);
            if (detailReal && detailReal.value && parseInt(detailReal.value) > 0) {
                // メイン画面にも反映
                if (mainReal && !mainReal.value) {
                    if (mainReal.updateValueSilently) {
                        mainReal.updateValueSilently(detailReal.value);
                    } else {
                        mainReal.value = detailReal.value;
                    }
                }
            }
        });
    });
}

/**
 * ドロップダウン初期化
 */
function initializeDropdownsWithNature() {
    // 既存のドロップダウン初期化
    setupPokemonDropdown('attackerPokemon', 'attacker');
    setupPokemonDropdown('defenderPokemon', 'defender');
    setupMoveDropdown();
    setupItemDropdown('attackerItem', 'attacker');
    setupItemDropdown('defenderItem', 'defender');
    setupNatureDropdowns();
}

/**
 * アイテム選択
 */
function selectItem(side, itemName) {
    const pokemon = side === 'attacker' ? attackerPokemon : defenderPokemon;
    
    if (!itemName) {
        pokemon.item = null;
        return;
    }
    
    const item = itemData.find(i => i.name === itemName);
    if (item) {
        pokemon.item = item;
    } else {
        pokemon.item = null;
    }
}

/**
 * 技選択
 */
function selectMove(moveName) {
    if (!moveName) {
        currentMove = null;
        hideAllMoveSpecialSettings();
        updateDamageCalculationButton();
        return;
    }
    
    const move = moveData.find(m => m.name === moveName);
    if (!move) {
        currentMove = null;
        hideAllMoveSpecialSettings();
        updateDamageCalculationButton();
        return;
    }
    
    currentMove = move;
    
    // 複数ターン技配列の1つ目を更新
    multiTurnMoves[0] = move;
    
    // 特殊な技の処理
    handleSpecialMove(move);
    
    // ダメージ計算ボタンの有効/無効を更新
    updateDamageCalculationButton();
}

/**
 * ポケモンドロップダウン設定
 */
function setupPokemonDropdown(inputId, side) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    // ドロップダウン作成
    const dropdown = document.createElement('div');
    dropdown.className = 'pokemon-dropdown';
    dropdown.style.display = 'none';
    document.body.appendChild(dropdown);
    
    // クリック時
    input.addEventListener('click', function(e) {
        e.stopPropagation();
        this.value = '';
        showPokemonList(dropdown, input, side);
    });
    
    // 入力時
    input.addEventListener('input', function() {
        filterPokemonList(this.value, dropdown, input, side);
    });

    // 入力完了時（フォーカスアウト、Enter）の処理を追加
    input.addEventListener('blur', function() {
        checkExactMatch(this.value, side);
    });
    
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkExactMatch(this.value, side);
            dropdown.style.display = 'none';
        }
    });
    
    // 外側クリックで閉じる
    document.addEventListener('click', function(e) {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });
}

/**
 * 技ドロップダウン設定
 */
function setupMoveDropdown() {
    const input = document.getElementById('attackMove');
    if (!input) return;
    
    const dropdown = document.createElement('div');
    dropdown.className = 'pokemon-dropdown';
    dropdown.style.display = 'none';
    document.body.appendChild(dropdown);
    
    input.addEventListener('click', function(e) {
        e.stopPropagation();
        this.value = '';
        showMoveList(dropdown, input);
    });
    
    input.addEventListener('input', function() {
        filterMoveList(this.value, dropdown, input);
    });
    
    // 完全一致チェックを追加
    input.addEventListener('blur', function() {
        checkExactMoveMatch(this.value);
    });
    
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkExactMoveMatch(this.value);
            dropdown.style.display = 'none';
        }
    });
    
    document.addEventListener('click', function(e) {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });
}

/**
 * アイテムドロップダウン設定
 */
function setupItemDropdown(inputId, side) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    const dropdown = document.createElement('div');
    dropdown.className = 'pokemon-dropdown';
    dropdown.style.display = 'none';
    document.body.appendChild(dropdown);
    
    input.addEventListener('click', function(e) {
        e.stopPropagation();
        this.value = '';
        showItemList(dropdown, input, side);
    });
    
    input.addEventListener('input', function() {
        filterItemList(this.value, dropdown, input, side);
    });
    
    // 完全一致チェックを追加
    input.addEventListener('blur', function() {
        checkExactItemMatch(this.value, side);
    });
    
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkExactItemMatch(this.value, side);
            dropdown.style.display = 'none';
        }
    });
    
    document.addEventListener('click', function(e) {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });
}

/**
 * 性格ドロップダウン設定
 */
function setupNatureDropdowns() {
    setupNatureDropdown('attackerNature', 'attacker');
    setupNatureDropdown('defenderNature', 'defender');
}

// オボンのみ関連関数（要求により変更なし）
function hideAllAbilityCheckboxes(side) {
  const abilityContainers = [
    'yogaPowerContainer', 'hugePowerContainer','harikiriContainer',
    'plusContainer', 'minusContainer', 'gutsContainer',
    'shinryokuContainer', 'moukaContainer', 'gekiryuuContainer', 'mushiNoShiraseContainer',
    'moraibiContainer'
  ];
  
  abilityContainers.forEach(id => {
    const container = document.getElementById(id);
    if (container) {
      container.style.display = 'none';
      const checkbox = container.querySelector('input[type="checkbox"]');
      if (checkbox) {
        checkbox.checked = false;
      }
    }
  });
}
function clearRealStatInputLimits(side) {
    ['hp', 'a', 'b', 'c', 'd', 's'].forEach(stat => {
        const mainId = `${side}Real${stat.toUpperCase()}`;
        const detailId = `${side}DetailReal${stat.toUpperCase()}`;
        
        [mainId, detailId].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.removeAttribute('min');
                input.removeAttribute('max');
            }
        });
    });
}
function getCastformTypeByWeather() {
    const weather = document.getElementById('weatherSelect')?.value;
    
    switch (weather) {
        case 'sunny':
            return ['ほのお'];
        case 'rain':
            return ['みず'];
        case 'sandstorm':
            return ['いわ'];
        case 'hail':
            return ['こおり'];
        default:
            return ['ノーマル']; // 天候なしの場合
    }
}
function updateAbilityCheckboxes(side, abilities) {
  // 配列でない場合は配列に変換
  const abilityList = Array.isArray(abilities) ? abilities : [abilities];
  
  // 一旦すべて非表示
  hideAllAbilityCheckboxes(side);
  
  // 該当する特性のチェックボックスを表示
  abilityList.forEach(ability => {
    switch(ability) {
      case 'ヨガパワー':
        showAndCheckAbility('yogaPowerContainer', 'yogaPowerCheck');
        break;
      case 'ちからもち':
        showAndCheckAbility('hugePowerContainer', 'hugePowerCheck');
        break;
      case 'はりきり':
        showAndCheckAbility('harikiriContainer', 'harikiriCheck');
        break;
      case 'プラス':
        showAndCheckAbility('plusContainer', 'plusheck');
        break;
      case 'マイナス':
        showAndCheckAbility('minusContainer', 'minusCheck');
        break;
      case 'こんじょう':
        showAndCheckAbility('gutsContainer', 'gutsCheck');
        break;
      case 'しんりょく':
        showAndCheckAbility('shinryokuContainer', 'shinryokuCheck');
        break;
      case 'もうか':
        showAndCheckAbility('moukaContainer', 'moukaCheck');
        break;
      case 'げきりゅう':
        showAndCheckAbility('gekiryuuContainer', 'gekiryuuCheck');
        break;
      case 'むしのしらせ':
        showAndCheckAbility('mushiNoShiraseContainer', 'mushiNoShiraseCheck');
        break;
      case 'もらいび':
        showAndCheckAbility('moraibiContainer', 'moraibiCheck');
        break;
    }
  });
}
function showAndCheckAbility(containerId, checkboxId) {
    document.querySelector('.attackerAbilityContainer').style.display = 'flex';
  const container = document.getElementById(containerId);
  if (container) {
    container.style.display = 'inline-block';
    // デフォルトではチェックを入れない（ユーザーが選択）
    const checkbox = document.getElementById(checkboxId);
    if (checkbox) {
      checkbox.checked = false;
    }
  }
}
function updateDefenderAbilityCheckboxes(abilities) {
    const abilityList = Array.isArray(abilities) ? abilities : [abilities];
    
    // まず全ての防御側特性を非表示
    hideAllDefenderAbilityCheckboxes();
    
    // 防御側の特性コンテナを表示するかどうか
    let hasDefenderAbility = false;
    
    abilityList.forEach(ability => {
        if (ability === 'あついしぼう') {
            hasDefenderAbility = true;
            const container = document.getElementById('atsuishibouContainer');
            if (container) {
                container.style.display = 'inline-block';
            }
        } else if (ability === 'ふしぎなうろこ') {
            hasDefenderAbility = true;
            const container = document.getElementById('fushiginaurokoContainer');
            if (container) {
                container.style.display = 'inline-block';
            }
        }
    });
    
    if (hasDefenderAbility) {
        document.querySelector('.defenderAbilityContainer').style.display = 'flex';
    }
}
function hideAllDefenderAbilityCheckboxes() {
    document.querySelector('.defenderAbilityContainer').style.display = 'none';
    const defenderAbilities = ['atsuishibouContainer', 'fushiginaurokoContainer'];
    defenderAbilities.forEach(id => {
        const container = document.getElementById(id);
        if (container) {
            container.style.display = 'none';
            const checkbox = container.querySelector('input[type="checkbox"]');
            if (checkbox) checkbox.checked = false;
        }
    });
}
function updateAllRealStatInputLimits(side) {
    realStatManager.updateInputLimits(side);
}
function selectMultiTurnMove(turn, moveName) {
    
    if (!moveName || moveName.trim() === '') {
        // 空の場合はnullを設定
        multiTurnMoves[turn] = null;
        return;
    }
    
    const move = moveData.find(m => m.name === moveName);
    if (move) {
        multiTurnMoves[turn] = move;
        
        // めざめるパワーの場合、タイプと分類を動的に更新
        if (move && move.class === 'awaken_power') {
            const newType = calculateHiddenPowerType();
            multiTurnMoves[turn] = { 
                ...move, 
                type: newType,
                category: getGen3CategoryByType(newType)
            };
        }
        // ウェザーボールの場合、天候に応じてタイプと分類を更新
        if (move && move.class === 'weather_ball') {
            const weatherData = getWeatherBallTypeAndCategory();
            multiTurnMoves[turn] = {
                ...move,
                type: weatherData.type,
                category: weatherData.category
            };
        }
    } else {
        multiTurnMoves[turn] = null;
    }
}
function adjustStatsFromRealValue(side, stat, targetValue) {
    const pokemon = side === 'attacker' ? attackerPokemon : defenderPokemon;
    
    // ポケモンが選択されていない場合はスキップ
    if (!pokemon.name || !pokemon.baseStats[stat]) {
        return;
    }
    
    // 現在の実数値を計算
    const currentRealStat = calculateCurrentStat(pokemon, stat);
    
    // 既に目標値と一致している場合はスキップ
    if (currentRealStat === targetValue) {
        return;
    }
    
    // 制限チェック
    const limits = calculateStatLimits(pokemon.baseStats[stat], pokemon.level, stat === 'hp');
    if (targetValue < limits.min || targetValue > limits.max) {
        console.warn(`実数値${targetValue}は範囲外です (${limits.min}-${limits.max})`);
        return;
    }
    
    // 最適化処理を実行
    const result = findOptimalStats(pokemon, stat, targetValue, pokemon.baseStats[stat], pokemon.level);
    
    if (result && isValidResult(result, targetValue, pokemon.baseStats[stat], pokemon.level, stat === 'hp')) {
        // 結果を適用
        pokemon.ivValues[stat] = result.iv;
        pokemon.evValues[stat] = result.ev;
        
        // 性格補正も変更された場合
        if (result.changeNature && result.natureMod !== undefined && stat !== 'hp') {
            pokemon.natureModifiers[stat] = result.natureMod;
        }
        
        // UI要素を更新
        updateIVEVInputs(side, stat, result.iv, result.ev);
    }
}
function updateNatureCheckboxes(side) {
    const target = side === 'attacker' ? attackerPokemon : defenderPokemon;
    
    // すべてのチェックボックスをクリア
    const checkboxes = document.querySelectorAll(`.nature-plus-checkbox[data-side="${side}"], .nature-minus-checkbox[data-side="${side}"]`);
    checkboxes.forEach(cb => cb.checked = false);
    
    // 現在の性格補正に基づいてチェック
    ['a', 'b', 'c', 'd', 's'].forEach(stat => {
        if (target.natureModifiers[stat] === 1.1) {
            const plusCheckbox = document.getElementById(`${side}${stat.toUpperCase()}Plus`);
            if (plusCheckbox) plusCheckbox.checked = true;
        } else if (target.natureModifiers[stat] === 0.9) {
            const minusCheckbox = document.getElementById(`${side}${stat.toUpperCase()}Minus`);
            if (minusCheckbox) minusCheckbox.checked = true;
        }
    });
    
    // メイン画面の性格補正ボタンも更新
    if (side === 'attacker') {
        updateMainNatureButtons(side, 'a', target.natureModifiers['a']);
        updateMainNatureButtons(side, 'c', target.natureModifiers['c']);
    } else {
        updateMainNatureButtons(side, 'b', target.natureModifiers['b']);
        updateMainNatureButtons(side, 'd', target.natureModifiers['d']);
    }
}
function updateDetailSummary(side) {
    // めざめるパワーのタイプと威力を計算（攻撃側の個体値を使用）
    let hiddenPowerType, hiddenPowerPower;
    
    if (side === 'attacker') {
        hiddenPowerType = calculateHiddenPowerType();
        hiddenPowerPower = calculateHiddenPowerBP();
    } else {
        // 防御側の場合も攻撃側の個体値でめざパを計算するか、
        // 防御側専用の計算関数を作成するかを選択
        // ここでは防御側専用の計算を実装
        hiddenPowerType = calculateDefenderHiddenPowerType();
        hiddenPowerPower = calculateDefenderHiddenPowerBP();
    }
    
    // 合計努力値を計算
    const pokemon = side === 'attacker' ? attackerPokemon : defenderPokemon;
    const totalEV = Object.values(pokemon.evValues).reduce((sum, ev) => sum + ev, 0);
    
    // 表示要素を取得
    const hiddenPowerDisplay = document.getElementById(`${side}HiddenPowerDisplay`);
    const totalEVDisplay = document.getElementById(`${side}TotalEVDisplay`);
    
    if (hiddenPowerDisplay) {
        hiddenPowerDisplay.textContent = `${hiddenPowerType} ${hiddenPowerPower}`;
    }
    
    if (totalEVDisplay) {
        if (totalEV > 508) {
            const excess = totalEV - 508;
            totalEVDisplay.textContent = `508+${excess}`;
            totalEVDisplay.style.color = '#dc3545'; // 赤色
            totalEVDisplay.style.fontWeight = 'bold';
        } else {
            totalEVDisplay.textContent = totalEV.toString();
            totalEVDisplay.style.color = '#333'; // 通常色
            totalEVDisplay.style.fontWeight = 'normal';
        }
    }
}
function updateMainNatureButtons(side, stat, value) {    
    // 攻撃側はA,Cのみ、防御側はB,Dのみ表示されている
    const shouldUpdate = (side === 'attacker' && (stat === 'a' || stat === 'c')) ||
                        (side === 'defender' && (stat === 'b' || stat === 'd')); 
    if (shouldUpdate) {
        const buttons = document.querySelectorAll(`.nature-btn[data-side="${side}"][data-stat="${stat}"]`);
        buttons.forEach((btn, index) => {
            const btnValue = parseFloat(btn.getAttribute('data-value'));           
            if (btnValue === value) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });
    }
}
function hideAllMoveSpecialSettings() {
    const multiHitContainer = document.getElementById('multiHitContainer');
    const pinchUpContainer = document.querySelector('.pinchUpContainer');
    const pinchDownContainer = document.querySelector('.pinchDownContainer');
    const twofoldContainer = document.getElementById('twofoldContainer');
    
    if (multiHitContainer) multiHitContainer.style.display = 'none';
    if (pinchUpContainer) pinchUpContainer.style.display = 'none';
    if (pinchDownContainer) pinchDownContainer.style.display = 'none';
    if (twofoldContainer) twofoldContainer.style.display = 'none';
}
function updateDamageCalculationButton() {
   const button = document.querySelector('.damage-calc-button');
   if (button) {
       button.setAttribute('onclick', 'performDamageCalculationEnhanced()');
   }
}
function handleSpecialMove(move) {
    if (!move) {
        hideAllMoveSpecialSettings();
        return;
    }
    
    // めざめるパワーの場合、タイプと分類を動的に更新
    if (currentMove && currentMove.class === 'awaken_power') {
        const newType = calculateHiddenPowerType();
        currentMove.type = newType;
        currentMove.category = getGen3CategoryByType(newType);
    }
    // ウェザーボールの場合、天候に応じてタイプと分類を更新
    if (currentMove && currentMove.class === 'weather_ball') {
        const weatherData = getWeatherBallTypeAndCategory();
        currentMove.type = weatherData.type;
        currentMove.category = weatherData.category;
    }
    
    // 全ての特殊設定を一旦非表示に
    const multiHitContainer = document.getElementById('multiHitContainer');
    const pinchUpContainer = document.querySelector('.pinchUpContainer');
    const pinchDownContainer = document.querySelector('.pinchDownContainer');
    const twofoldContainer = document.getElementById('twofoldContainer');
    
    if (multiHitContainer) multiHitContainer.style.display = 'none';
    if (pinchUpContainer) pinchUpContainer.style.display = 'none';
    if (pinchDownContainer) pinchDownContainer.style.display = 'none';
    if (twofoldContainer) twofoldContainer.style.display = 'none';

    // 技のクラスに応じて表示
    switch (move.class) {
        case 'two_hit':
            // リストは表示しない（固定2回なので）
            break;
            
        case 'multi_hit':
            if (multiHitContainer) {
                multiHitContainer.style.display = 'block';
            }
            break;
            
        case 'pinch_up':
            if (pinchUpContainer) {
                pinchUpContainer.style.display = 'flex';
                updatePinchHPValues();
            }
            break;
            
        case 'pinch_down':
            if (pinchDownContainer) {
                pinchDownContainer.style.display = 'flex';
                updatePinchHPValues();
            }
            break;
            
        case 'two_fold':
            if (twofoldContainer) {
                twofoldContainer.style.display = 'flex';
            }
            break;
    }
}
function showPokemonList(dropdown, input, side) {
    dropdown.innerHTML = '';
    
    const rect = input.getBoundingClientRect();
    dropdown.style.top = (rect.bottom + window.scrollY) + 'px';
    dropdown.style.left = (rect.left + window.scrollX) + 'px';
    dropdown.style.width = rect.width + 'px';
    
    // 最初の30件を表示
    const displayItems = allPokemonData.slice(0, 30);
    
    displayItems.forEach(pokemon => {
        const item = createDropdownItem(pokemon.name, () => {
            input.value = pokemon.name;
            dropdown.style.display = 'none';
            selectPokemon(side, pokemon.name);
        });
        dropdown.appendChild(item);
    });
    
    dropdown.style.display = 'block';
}
function filterPokemonList(searchText, dropdown, input, side) {
    if (!searchText) {
        dropdown.style.display = 'none';
        return;
    }
    
    dropdown.innerHTML = '';
    
    const search = searchText.toLowerCase();
    
    // カタカナ・ひらがな変換
    const toHiragana = (text) => {
        return text.replace(/[\u30A1-\u30F6]/g, function(match) {
            return String.fromCharCode(match.charCodeAt(0) - 0x60);
        });
    };
    
    const toKatakana = (text) => {
        return text.replace(/[\u3041-\u3096]/g, function(match) {
            return String.fromCharCode(match.charCodeAt(0) + 0x60);
        });
    };
    
    const hiraganaSearch = toHiragana(search);
    const katakanaSearch = toKatakana(search);
    
    const filtered = allPokemonData.filter(pokemon => {
        const name = pokemon.name ? pokemon.name.toLowerCase() : '';
        const hiragana = pokemon.hiragana ? pokemon.hiragana.toLowerCase() : '';
        const romaji = pokemon.romaji ? pokemon.romaji.toLowerCase() : '';
        
        // 前方一致検索
        return name.startsWith(search) || 
               name.startsWith(hiraganaSearch) ||
               name.startsWith(katakanaSearch) ||
               hiragana.startsWith(search) ||
               hiragana.startsWith(hiraganaSearch) ||
               romaji.startsWith(search);
    });
    
    const displayItems = filtered.slice(0, 30);
    
    displayItems.forEach(pokemon => {
        const item = createDropdownItem(pokemon.name, () => {
            input.value = pokemon.name;
            dropdown.style.display = 'none';
            selectPokemon(side, pokemon.name);
        });
        dropdown.appendChild(item);
    });
    
    const rect = input.getBoundingClientRect();
    dropdown.style.top = (rect.bottom + window.scrollY) + 'px';
    dropdown.style.left = (rect.left + window.scrollX) + 'px';
    dropdown.style.width = rect.width + 'px';
    
    dropdown.style.display = displayItems.length > 0 ? 'block' : 'none';
}
function checkExactMatch(inputText, side) {
    if (!inputText) return;
    
    // カタカナ、ひらがな、ローマ字での完全一致を検索
    const exactMatch = allPokemonData.find(pokemon => {
        return pokemon.name === inputText ||
               pokemon.hiragana === inputText ||
               (pokemon.romaji && pokemon.romaji.toLowerCase() === inputText.toLowerCase());
    });
    
    if (exactMatch) {
        selectPokemon(side, exactMatch.name);
    }
}
function showMoveList(dropdown, input) {
    dropdown.innerHTML = '';
    
    const rect = input.getBoundingClientRect();
    dropdown.style.top = (rect.bottom + window.scrollY) + 'px';
    dropdown.style.left = (rect.left + window.scrollX) + 'px';
    dropdown.style.width = rect.width + 'px';
    
    const displayItems = moveData.slice(0, 30);
    
    displayItems.forEach(move => {
        const item = createDropdownItem(move.name, () => {
            //console.log(`ドロップダウンから技選択: ${move.name}`);
            input.value = move.name;
            dropdown.style.display = 'none';
            selectMove(move.name);
        });
        dropdown.appendChild(item);
    });
    
    dropdown.style.display = 'block';
}
function filterMoveList(searchText, dropdown, input) {
    if (!searchText) {
        dropdown.style.display = 'none';
        return;
    }
    
    dropdown.innerHTML = '';
    
    const search = searchText.toLowerCase();
    
    // カタカナ・ひらがな変換
    const toHiragana = (text) => {
        return text.replace(/[\u30A1-\u30F6]/g, function(match) {
            return String.fromCharCode(match.charCodeAt(0) - 0x60);
        });
    };
    
    const toKatakana = (text) => {
        return text.replace(/[\u3041-\u3096]/g, function(match) {
            return String.fromCharCode(match.charCodeAt(0) + 0x60);
        });
    };
    
    const hiraganaSearch = toHiragana(search);
    const katakanaSearch = toKatakana(search);
    
    const filtered = moveData.filter(move => {
        const name = move.name ? move.name.toLowerCase() : '';
        const hiragana = move.hiragana ? move.hiragana.toLowerCase() : '';
        const romaji = move.romaji ? move.romaji.toLowerCase() : '';
        
        // 前方一致検索
        return name.includes(search) || 
               name.includes(hiraganaSearch) ||
               name.includes(katakanaSearch) ||
               hiragana.includes(search) ||
               hiragana.includes(hiraganaSearch) ||
               romaji.includes(search);
    });
    
    const displayItems = filtered.slice(0, 30);
    
    displayItems.forEach(move => {
        const item = createDropdownItem(move.name, () => {
            input.value = move.name;
            dropdown.style.display = 'none';
            selectMove(move.name);
        });
        dropdown.appendChild(item);
    });
    
    const rect = input.getBoundingClientRect();
    dropdown.style.top = (rect.bottom + window.scrollY) + 'px';
    dropdown.style.left = (rect.left + window.scrollX) + 'px';
    dropdown.style.width = rect.width + 'px';
    
    dropdown.style.display = displayItems.length > 0 ? 'block' : 'none';
}
function checkExactMoveMatch(inputText) {
    
    if (!inputText) {
        //console.log('空文字のため技をクリア');
        currentMove = null;
        // 全ての特殊設定を非表示に
        hideAllMoveSpecialSettings();
        return;
    }
    
    const exactMatch = moveData.find(move => {
        return move.name === inputText ||
               (move.hiragana && move.hiragana === inputText) ||
               (move.romaji && move.romaji.toLowerCase() === inputText.toLowerCase());
    });
    
    if (exactMatch) {
        //console.log(`一致する技が見つかりました: ${exactMatch.name}`);
        selectMove(exactMatch.name);
    } else {
        //console.log(`一致する技が見つかりません: "${inputText}"`);
        currentMove = null;
        hideAllMoveSpecialSettings();
    }
}
function showItemList(dropdown, input, side) {
    dropdown.innerHTML = '';
    
    const rect = input.getBoundingClientRect();
    dropdown.style.top = (rect.bottom + window.scrollY) + 'px';
    dropdown.style.left = (rect.left + window.scrollX) + 'px';
    dropdown.style.width = rect.width + 'px';
    
    // サイドによってフィルタリング
    const filteredItems = itemData.filter(item => {
        if (side === 'attacker') {
            return item.timing === 'attackMod';
        } else {
            return item.timing !== 'attackMod';
        }
    });
    
    filteredItems.forEach(item => {
        const itemElement = createDropdownItem(item.name, () => {
            input.value = item.name;
            dropdown.style.display = 'none';
            selectItem(side, item.name);
        });
        dropdown.appendChild(itemElement);
    });
    
    dropdown.style.display = 'block';
}
function filterItemList(searchText, dropdown, input, side) {
    if (!searchText) {
        dropdown.style.display = 'none';
        return;
    }
    
    dropdown.innerHTML = '';
    
    const search = searchText.toLowerCase();
    
    const toHiragana = (text) => {
        return text.replace(/[\u30A1-\u30F6]/g, function(match) {
            return String.fromCharCode(match.charCodeAt(0) - 0x60);
        });
    };
    
    const toKatakana = (text) => {
        return text.replace(/[\u3041-\u3096]/g, function(match) {
            return String.fromCharCode(match.charCodeAt(0) + 0x60);
        });
    };
    
    const hiraganaSearch = toHiragana(search);
    const katakanaSearch = toKatakana(search);
    
    // サイドによってフィルタリング
    const filtered = itemData.filter(item => {
        // まずタイミングでフィルタ
        if (side === 'attacker' && item.timing !== 'attackMod') return false;
        if (side === 'defender' && item.timing === 'attackMod') return false;
        
        // 次に検索文字でフィルタ
        const name = item.name ? item.name.toLowerCase() : '';
        const hiragana = item.hiragana ? item.hiragana.toLowerCase() : '';
        const romaji = item.romaji ? item.romaji.toLowerCase() : '';
        
        return name.includes(search) || 
               name.includes(hiraganaSearch) ||
               name.includes(katakanaSearch) ||
               hiragana.includes(search) ||
               hiragana.includes(hiraganaSearch) ||
               romaji.includes(search);
    });
    
    filtered.forEach(item => {
        const itemElement = createDropdownItem(item.name, () => {
            input.value = item.name;
            dropdown.style.display = 'none';
            selectItem(side, item.name);
        });
        dropdown.appendChild(itemElement);
    });
    
    const rect = input.getBoundingClientRect();
    dropdown.style.top = (rect.bottom + window.scrollY) + 'px';
    dropdown.style.left = (rect.left + window.scrollX) + 'px';
    dropdown.style.width = rect.width + 'px';
    
    dropdown.style.display = filtered.length > 0 ? 'block' : 'none';
}
function checkExactItemMatch(inputText, side) {
    if (!inputText) {
        // 空の場合はアイテムをクリア
        selectItem(side, null);
        return;
    }
    
    const exactMatch = itemData.find(item => {
        return item.name === inputText ||
               (item.hiragana && item.hiragana === inputText) ||
               (item.romaji && item.romaji.toLowerCase() === inputText.toLowerCase());
    });
    
    if (exactMatch) {
        selectItem(side, exactMatch.name);
    } else {
        // 一致しない場合もアイテムをクリア
        selectItem(side, null);
    }
}
function setupNatureDropdown(inputId, side) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    // ドロップダウン作成
    const dropdown = document.createElement('div');
    dropdown.className = 'pokemon-dropdown nature-dropdown';
    dropdown.style.display = 'none';
    document.body.appendChild(dropdown);
    
    // クリック時
    input.addEventListener('click', function(e) {
        e.stopPropagation();
        this.value = '';
        showNatureList(dropdown, input, side);
    });
    
    // 入力時
    input.addEventListener('input', function() {
        filterNatureList(this.value, dropdown, input, side);
    });

    // 入力完了時（フォーカスアウト、Enter）の処理
    input.addEventListener('blur', function() {
        checkExactNatureMatch(this.value, side);
    });
    
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkExactNatureMatch(this.value, side);
            dropdown.style.display = 'none';
        }
    });
    
    // 外側クリックで閉じる
    document.addEventListener('click', function(e) {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });
}

// ========================================
// IV. CORE CALCULATION LOGIC
// ========================================

// ========================================
// IV-A. PURE CALCULATION FUNCTIONS
// ========================================

/**
 * 連続技計算専用クラス
 */
class MultiHitCalculator {
    constructor() {
        // 連続技の回数と発生確率（固定データ）
        this.hitDistribution = [
            { hits: 2, probability: 3/8 },  // 37.5%
            { hits: 3, probability: 3/8 },  // 37.5%
            { hits: 4, probability: 1/8 },  // 12.5%
            { hits: 5, probability: 1/8 }   // 12.5%
        ];
    }
    
    /**
     * 急所率を動的に取得
     */
    getCriticalRate() {
        return getCriticalRate(); // グローバル関数を呼び出し
    }
    
    /**
     * 通常攻撃率を動的に取得
     */
    getNormalRate() {
        return 1 - this.getCriticalRate();
    }
    
    /**
     * 連続技の瀕死率を計算（メイン関数）
     */
    calculateMultiHitKORate(singleMinDamage, singleMaxDamage, targetHP, move) {
        console.log(`=== 連続技統合計算開始: ${move.name} ===`);
        console.log(`1発ダメージ: ${singleMinDamage}~${singleMaxDamage}, 対象HP: ${targetHP}`);
        
        const criticalRate = this.getCriticalRate();
        console.log(`急所率: ${(criticalRate * 100).toFixed(2)}% (${criticalRate === 1/8 ? 'ピントレンズ' : '通常'})`);
        
        // 命中率を計算（各種補正込み）
        const accuracy = this.calculateAccuracy(move);
        
        // 各回数での瀕死確率を計算（命中率なし）
        let totalKOProbability = 0;
        const detailResults = [];
        
        for (const { hits, probability } of this.hitDistribution) {
            const koRate = this.calculateKOForSpecificHits(
                singleMinDamage, 
                singleMaxDamage, 
                hits, 
                targetHP
            );
            
            const weightedKORate = koRate * probability;
            totalKOProbability += weightedKORate;
            
            detailResults.push({
                hits: hits,
                koRate: koRate,
                probability: probability,
                weightedKORate: weightedKORate
            });
            
            console.log(`${hits}回: 瀕死率${(koRate * 100).toFixed(2)}% × ${(probability * 100).toFixed(1)}% = ${(weightedKORate * 100).toFixed(3)}%`);
        }
        
        console.log(`命中前総合瀕死率: ${(totalKOProbability * 100).toFixed(3)}%`);
        // 最後に命中率を適用
        const finalKORate = totalKOProbability * accuracy;
        console.log(`命中率適用後: ${(finalKORate * 100).toFixed(3)}%`);
        console.log(`=== 連続技統合計算完了 ===`);
        
        return {
            koRatePercent: finalKORate * 100,
            accuracy: accuracy,
            preAccuracyRate: totalKOProbability * 100,
            detailResults: detailResults
        };
    }
    
    /**
     * 命中率を計算（各種補正込み）
     */
    calculateAccuracy(move) {
        // 天候の取得
        const weather = document.getElementById('weatherSelect')?.value || 'none';
        
        // 必中技の判定
        if (move.accuracy === 0 || (weather === 'rain' && move.name === 'かみなり')) {
            return 1.0;
        }
        
        let accuracy = (move.accuracy || 100) / 100;
        
        // はりきりの効果
        if (document.getElementById('harikiriCheck')?.checked && move.category === 'Physical') {
            accuracy *= 0.8;
        }
        
        // ひかりのこなの効果
        if (defenderPokemon.item && defenderPokemon.item.name === 'ひかりのこな') {
            accuracy *= 0.9;
        }
        
        // 回避ランクの適用
        const evasionRank = parseInt(document.getElementById('defenderEvasionRank')?.value) || 0;
        if (evasionRank !== 0) {
            const evasionMultiplier = getAccuracyMultiplier(-evasionRank);
            accuracy = Math.min(1, accuracy * evasionMultiplier);
        }
        
        return accuracy;
    }
    
    /**
     * 特定回数での瀕死確率を計算（急所考慮、命中率なし）
     */
    calculateKOForSpecificHits(singleMinDamage, singleMaxDamage, hitCount, targetHP) {
        const criticalRate = this.getCriticalRate();
        
        // HP状態とその確率を管理（動的プログラミング）
        let states = new Map();
        states.set(targetHP, 1.0);
        
        for (let hit = 0; hit < hitCount; hit++) {
            const newStates = new Map();
            
            for (const [hp, prob] of states) {
                if (hp <= 0) {
                    // 既に瀕死の場合はそのまま維持
                    newStates.set(0, (newStates.get(0) || 0) + prob);
                    continue;
                }
                
                // 通常ダメージの処理
                this.processNormalDamage(hp, prob, singleMinDamage, singleMaxDamage, newStates);
                
                // 急所ダメージの処理
                this.processCriticalDamage(hp, prob, singleMinDamage, singleMaxDamage, newStates);
            }
            
            states = newStates;
        }
        
        const koRate = states.get(0) || 0;
        return koRate;
    }
    
    /**
     * 通常ダメージの処理
     */
    processNormalDamage(hp, prob, singleMinDamage, singleMaxDamage, newStates) {
        const normalPatterns = singleMaxDamage - singleMinDamage + 1;
        const normalRate = this.getNormalRate();
        
        for (let i = 0; i < normalPatterns; i++) {
            const damage = singleMinDamage + i;
            const newHP = Math.max(0, hp - damage);
            const patternProb = prob * normalRate / normalPatterns;
            
            newStates.set(newHP, (newStates.get(newHP) || 0) + patternProb);
        }
    }
    
    /**
     * 急所ダメージの処理
     */
    processCriticalDamage(hp, prob, singleMinDamage, singleMaxDamage, newStates) {
        const critMinDamage = singleMinDamage * 2;
        const critMaxDamage = singleMaxDamage * 2;
        const critPatterns = critMaxDamage - critMinDamage + 1;
        const criticalRate = this.getCriticalRate();
        
        for (let i = 0; i < critPatterns; i++) {
            const damage = critMinDamage + i;
            const newHP = Math.max(0, hp - damage);
            const patternProb = prob * criticalRate / critPatterns;
            
            newStates.set(newHP, (newStates.get(newHP) || 0) + patternProb);
        }
    }
    
    /**
     * 表示用のダメージ範囲を計算
     */
    getDisplayDamageRange(singleMinDamage, singleMaxDamage, constantDamage = 0) {
        return {
            min: singleMinDamage * 2 + constantDamage,  // 最小2回
            max: singleMaxDamage * 5 + constantDamage,  // 最大5回
            text: `${singleMinDamage * 2 + constantDamage}~${singleMaxDamage * 5 + constantDamage}`
        };
    }
}

// グローバルインスタンス
const multiHitCalculator = new MultiHitCalculator();

/**
 * ポケモンのステータス実数値を計算する純粋な関数
 * @param {Object} pokemon - ポケモンオブジェクト
 * @returns {Object} 計算されたステータス
 */
function calculateStats(pokemon) {
    const level = pokemon.level;
    const stats = {};
    
    // HP計算（性格補正なし）
    const hpBase = pokemon.baseStats.hp * 2 + pokemon.ivValues.hp + Math.floor(pokemon.evValues.hp / 4);
    const hpLevel = Math.floor(hpBase * level / 100);
    stats.hp = hpLevel + level + 10;
    
    // その他のステータス
    ['a', 'b', 'c', 'd', 's'].forEach(stat => {
        const base = pokemon.baseStats[stat] * 2 + pokemon.ivValues[stat] + Math.floor(pokemon.evValues[stat] / 4);
        const levelCalc = Math.floor(base * level / 100);
        const beforeNature = levelCalc + 5;
        stats[stat] = Math.floor(beforeNature * pokemon.natureModifiers[stat]);
    });
    
    return stats;
}

/**
 * パラメータを指定してステータス実数値を計算する純粋な関数
 * @param {number} baseStat - 種族値
 * @param {number} level - レベル
 * @param {number} iv - 個体値
 * @param {number} ev - 努力値
 * @param {number} natureModifier - 性格補正
 * @param {boolean} isHP - HPかどうか
 * @returns {number} 計算されたステータス実数値
 */
function calculateStatWithParams(baseStat, level, iv, ev, natureModifier, isHP) {
  if (isHP) {
    const base = baseStat * 2 + iv + Math.floor(ev / 4);
    const levelCalc = Math.floor(base * level / 100);
    return levelCalc + level + 10;
  } else {
    const base = baseStat * 2 + iv + Math.floor(ev / 4);
    const levelCalc = Math.floor(base * level / 100);
    const beforeNature = levelCalc + 5;
    return Math.floor(beforeNature * natureModifier);
  }
}

/**
 * ステータスの最小値・最大値を計算する純粋な関数
 * @param {number} baseStat - 種族値
 * @param {number} level - レベル
 * @param {boolean} isHP - HPかどうか
 * @returns {Object} {min: 最小値, max: 最大値}
 */
function calculateStatLimits(baseStat, level, isHP = false) {
  if (isHP) {
    // HPの場合
    const minBase = baseStat * 2 + 0 + 0; // IV0, EV0
    const minLevel = Math.floor(minBase * level / 100);
    const minStat = minLevel + level + 10;
    
    const maxBase = baseStat * 2 + 31 + Math.floor(252 / 4); // IV31, EV252
    const maxLevel = Math.floor(maxBase * level / 100);
    const maxStat = maxLevel + level + 10;
    
    const result = { min: minStat, max: maxStat };
    return result;
  } else {
    // HP以外の場合
    const minBase = baseStat * 2 + 0 + 0; // IV0, EV0
    const minLevel = Math.floor(minBase * level / 100);
    const minBeforeNature = minLevel + 5;
    const minStat = Math.floor(minBeforeNature * 90 / 100); // 性格補正0.9
    
    const maxBase = baseStat * 2 + 31 + Math.floor(252 / 4); // IV31, EV252
    const maxLevel = Math.floor(maxBase * level / 100);
    const maxBeforeNature = maxLevel + 5;
    const maxStat = Math.floor(maxBeforeNature * 110 / 100); // 性格補正1.1

    const result = { min: minStat, max: maxStat };
    return result;
  }
}

/**
 * のろいダメージ計算（最大HPの1/4）
 * @param {number} maxHP - 最大HP
 * @returns {number} のろいダメージ
 */
function calculateCurseDamage(maxHP) {
    return Math.floor(maxHP / 4);
}

/**
 * あくむダメージ計算（最大HPの1/4）
 * @param {number} maxHP - 最大HP
 * @returns {number} あくむダメージ
 */
function calculateNightmareDamage(maxHP) {
    return Math.floor(maxHP / 4);
}

/**
 * やどりぎダメージ計算（最大HPの1/8）
 * @param {number} maxHP - 最大HP
 * @returns {number} やどりぎダメージ
 */
function calculateLeechSeedDamage(maxHP) {
    return Math.floor(maxHP / 8);
}

/**
 * やどりぎ回復量計算（最大HPの1/8回復）
 * @param {number} maxHP - 最大HP
 * @returns {number} やどりぎ回復量
 */
function calculateLeechSeed2HealAmount(maxHP) {
    return Math.floor(maxHP / 8);
}

// ========================================
// IV-B. DOM-DEPENDENT CALCULATION FUNCTIONS
// ========================================

// Note: calculateDamage function and Obon-related functions
// are preserved exactly as they were in the original code

/**
 * ダメージ計算のメイン関数（DOM依存）
 * この関数は要求により変更されません
 */
function calculateDamage(attack, defense, level, power, category, moveType, attackerTypes, defenderTypes, atkRank, defRank) {
  let finalAttack = attack;
  let finalDefense = defense;
  let finalPower = power;
  
  // きしかいせい・じたばた
  if (currentMove && currentMove.class === "pinch_up"){
    const currentHP = parseInt(document.getElementById('pinchUp_currentHP').value) || 1;
    const maxHP = parseInt(document.getElementById('pinchUp_maxHP').value) || 1;
    const HPrate = Math.floor(currentHP * 48 / maxHP);
  
    if (HPrate >= 33) {
      finalPower = 20;
    } else if (HPrate >= 17) {
      finalPower = 40;
    } else if (HPrate >= 10) {
      finalPower = 80;
    } else if (HPrate >= 5) {
      finalPower = 100;
    } else if (HPrate >= 2) {
      finalPower = 150;
    } else {
      finalPower = 200;
    }
  }

  // 1. ちからもちorヨガパワー
  if (document.getElementById('yogaPowerCheck').checked && category === "Physical") {
    finalAttack = Math.floor(finalAttack * 2);
  }
  else if (document.getElementById('hugePowerCheck').checked && category === "Physical") {
    finalAttack = Math.floor(finalAttack * 2);
  }
  // 2. バッジ補正 (今回はスキップ)

  // 3. もちもの補正
  if (attackerPokemon.item) {
      const item = attackerPokemon.item;
      if (item.timing === "attackMod") {
          const modifier = category === "Physical" ? (item.a || 1.0) : (item.c || 1.0);
          finalAttack = Math.floor(finalAttack * modifier);
      }
  }
  if (defenderPokemon.item) {
      const item = defenderPokemon.item;
      const modifier = category === "Physical" ? (item.b || 1.0) : (item.d || 1.0);
      finalDefense = Math.floor(finalAttack * modifier);
  }
          
  // 4. 特性 (実数値補正系)
  const isGuts = document.getElementById('gutsCheck').checked;
  // あついしぼう
  if (document.getElementById('atsuishibouCheck')?.checked && 
      (moveType === 'ほのお' || moveType === 'こおり')) {
      finalAttack = Math.floor(finalAttack / 2);
  }
  // はりきり
  else if (document.getElementById('harikiriCheck').checked && category === "Physical") {
    finalAttack = Math.floor(finalAttack * 150 / 100);
  }
  // プラス
  else if (document.getElementById('plusCheck').checked && category === "Special") {
    finalAttack = Math.floor(finalAttack * 150 / 100);
  }
  // マイナス
  else if (document.getElementById('minusCheck').checked && category === "Special") {
    finalAttack = Math.floor(finalAttack * 150 / 100);
  }
  // こんじょう
  else if (isGuts && category === "Physical") {
    finalAttack = Math.floor(finalAttack * 150 / 100);
  }
  // ふしぎなうろこ
  else if (document.getElementById('fushiginaurokoCheck').checked && category === "Physical") {
    finalDefense = Math.floor(finalDefense * 150 / 100);
  }

  //5. 遊び
  if (document.getElementById('doroasobiCheck').checked && moveType === 'でんき') {
    // どろあそび
    finalPower = Math.floor(finalPower / 2);
  }
  if (document.getElementById('mizuasobiCheck').checked && moveType === 'ほのお') {
    // みずあそび
    finalPower = Math.floor(finalPower / 2);
  }
  
  //6. 特性 (威力補正系)
  if (document.getElementById('shinryokuCheck').checked && moveType === 'くさ') {
    // しんりょく
    finalPower = Math.floor(finalPower * 150/100);
  }
  else if (document.getElementById('moukaCheck').checked && moveType === 'ほのお') {
    // もうか
    finalPower = Math.floor(finalPower * 150/100);
  }
  else if (document.getElementById('gekiryuuCheck').checked && moveType === 'みず') {
    // げきりゅう
    finalPower = Math.floor(finalPower * 150/100);
  }
  else if (document.getElementById('mushiNoShiraseCheck').checked && moveType === 'むし') {
    // むしのしらせ
    finalPower = Math.floor(finalPower * 150/100);
  }
  
  // じばく・だいばくはつの防御半減
  if (currentMove && currentMove.class === "b_harf") {
    finalDefense = Math.floor(finalDefense / 2);
  }
  
  // ランク補正
  const atkRankMultiplier = getRankMultiplier(atkRank);
  const defRankMultiplier = getRankMultiplier(defRank);

  finalAttack = Math.floor(finalAttack * atkRankMultiplier);
  finalDefense = Math.floor(finalDefense * defRankMultiplier);
  
  // 基本ダメージ計算
  const param1 = Math.floor(finalAttack * finalPower);
  const param2 = Math.floor(level * 2 / 5) + 2;
  let proc = Math.floor(param1 * param2);
  proc = Math.floor(proc / finalDefense);
  proc = Math.floor(proc / 50);
  
  // やけど
  const isBurned = document.getElementById('burnCheck').checked;
  if (isBurned && category === "Physical" && !isGuts) {
      proc = Math.floor(proc / 2);
  }
  
  // ダブルかチェック
  const isDouble = document.getElementById('doubleCheck').checked;

  // ひかりのかべ・リフレクター
  const hasWall = document.getElementById('wallCheck').checked;
  if (hasWall && !isDouble) {
    proc = Math.floor(proc / 2);
  }
  else if (hasWall && isDouble){
    //ダブルのとき
    proc = Math.floor(proc * 2 / 3);
  }
  
  // ダブル半減
  if (isDouble && currentMove.target === 2) {
      proc = Math.floor(proc / 2);
  }
   
  // 天候補正
  const weather = document.getElementById('weatherSelect').value;
  if (weather === 'rain' && moveType === 'みず') {
   // あめがふりつづいている 水2倍
   proc = Math.floor(proc * 2);
  } else if (weather === 'rain' && moveType === 'ほのお') {
   // あめがふりつづいている 炎半減
   proc = Math.floor(proc / 2);
  } else if (weather === 'rain' && currentMove.class === 'solarbeam') {
   // あめがふりつづいている ソーラービーム半減
   proc = Math.floor(proc / 2);
  } else if (weather === 'sunny' && moveType === 'ほのお') {
   // ひざしがつよい 炎2倍
   proc = Math.floor(proc * 2);
  } else if (weather === 'sunny' && moveType === 'みず') {
   // ひざしがつよい 水半減
   proc = Math.floor(proc / 2);
  }
   
  // もらいび
  const isFlashFire = document.getElementById('moraibiCheck').checked;
  if(isFlashFire && moveType === 'ほのお'){
    proc = Math.floor(proc * 15 / 10);
  }

  // proc+2
  proc += 2;
   
  // 急所
  const isCritical = document.getElementById('criticalCheck').checked;
  if (isCritical) {
      proc = Math.floor(proc * 2);
  }

  // おいうち成功
  // たつまき、かぜおこし -> そらをとぶ状態
  // なみのり -> ダイビング状態
  // ふみつけ -> ちいさくなる状態
  // きつけ -> まひ
  // からげんき(状態異常時)
  // リベンジ(被ダメージ後)
  const isTwofold = document.getElementById('twofoldCheck').checked;
  if (isTwofold) {
      proc = Math.floor(proc * 2);
  }

  // ウェザーボール(天候変化後)
  const isWeatherBall = currentMove && currentMove.class === 'weather_ball';
  const hasWeather = document.getElementById('weatherSelect').value !== 'none';
  if (isWeatherBall && hasWeather) {
    proc = Math.floor(proc * 2);
  }

  // じゅうでん
  const isCharging = document.getElementById('chargingCheck').checked;
  if (isCharging && moveType === 'でんき') {
      proc = Math.floor(proc * 2);
  }
  
  // てだすけ
  const isHelping = document.getElementById('helpCheck').checked;
  if (isHelping) {
      proc = Math.floor(proc * 15 / 10);
  }

  // タイプ一致
  const isStab = attackerTypes.includes(moveType);
  if (isStab) {
    proc = Math.floor(proc * 15 / 10);
  }
  
  // タイプ相性定義
  let typeEffectiveness = 1.0;
  if (defenderTypes.length > 0 && typeMultiplierData[moveType]) {
      typeEffectiveness = defenderTypes.reduce((effectiveness, defType) => {
          if (typeMultiplierData[moveType][defType]) {
              return effectiveness * typeMultiplierData[moveType][defType];
          }
          return effectiveness;
      }, 1.0);
  }
  
  // タイプ相性
  proc = Math.floor(proc * typeEffectiveness);
  
  // 乱数(最終ダメージ)
  const baseDamage = Math.max(1, proc);
  const minDamage = Math.floor(baseDamage * 85 / 100);
  const maxDamage = baseDamage;
  
  return [Math.max(1, minDamage), maxDamage];
}

// ========================================
// OBON-RELATED FUNCTIONS (PRESERVED AS-IS)
// ========================================

/**
 * オボンのみ専用の瀕死率計算（ログ抑制版）
 */
function calculateKORateWithSitrusBerryOranOnly(currentHP, maxHP, moveDataList, turnIndex, berryUsed, currentProbability, results, hpInfo) {
    
    if (turnIndex >= moveDataList.length) {
        return;
    }
    
    const moveData = moveDataList[turnIndex];
    if (!moveData) {
        calculateKORateWithSitrusBerryOranOnly(currentHP, maxHP, moveDataList, turnIndex + 1, berryUsed, currentProbability, results, hpInfo);
        return;
    }
    
    // 技が外れた場合
    const missProbability = 1 - moveData.accuracy;
    if (missProbability > 0) {
        const constantDamage = calculateTotalConstantDamage(maxHP, defenderPokemon.types, turnIndex + 1);
        const finalHP = Math.max(0, currentHP - constantDamage);
        calculateKORateWithSitrusBerryOranOnly(finalHP, maxHP, moveDataList, turnIndex + 1, berryUsed, currentProbability * missProbability, results, hpInfo);
    }
    
    // 技が命中した場合の処理
    const hitProbability = moveData.accuracy;
    
    if (hitProbability > 0) {
        let totalKOProbability = 0;
        const survivalPatterns = [];
        
        // 全16パターンの通常ダメージを個別計算
        for (let i = 0; i < 16; i++) {
            const normalDamage = Math.floor(moveData.minDamage + (moveData.maxDamage - moveData.minDamage) * i / 15);
            const normalPatternProb = (1/16) * (15/16);
            
            if (normalDamage >= currentHP) {
                totalKOProbability += normalPatternProb;
            } else {
                const hpAfterDamage = currentHP - normalDamage;
                const surviveProb = currentProbability * hitProbability * normalPatternProb;
                
                survivalPatterns.push({
                    hpAfter: hpAfterDamage,
                    probability: surviveProb,
                    damageType: 'normal'
                });
            }
        }
        
        // 全16パターンの急所ダメージを個別計算
        for (let i = 0; i < 16; i++) {
            const critDamage = Math.floor(moveData.minCritDamage + (moveData.maxCritDamage - moveData.minCritDamage) * i / 15);
            const critPatternProb = (1/16) * (1/16);
            
            if (critDamage >= currentHP) {
                totalKOProbability += critPatternProb;
            } else {
                const hpAfterDamage = currentHP - critDamage;
                const surviveProb = currentProbability * hitProbability * critPatternProb;
                
                survivalPatterns.push({
                    hpAfter: hpAfterDamage,
                    probability: surviveProb,
                    damageType: 'critical'
                });
            }
        }
        
        // 瀕死確率を結果に加算
        const koThisTurn = currentProbability * hitProbability * totalKOProbability;
        if (koThisTurn > 0) {
            for (let i = turnIndex; i < results.length; i++) {
                results[i] += koThisTurn;
            }
        }
        
        // 生存パターンをHP値でグループ化
        const hpGroups = new Map();
        survivalPatterns.forEach(pattern => {
            const hp = pattern.hpAfter;
            if (!hpGroups.has(hp)) {
                hpGroups.set(hp, 0);
            }
            hpGroups.set(hp, hpGroups.get(hp) + pattern.probability);
        });
        
        // グループ化されたHPパターンを処理
        hpGroups.forEach((totalProbability, hpAfterDamage) => {
            processPostDamageHealingOranOnly(hpAfterDamage, maxHP, moveDataList, turnIndex, berryUsed, totalProbability, results, hpInfo);
        });
    }
}

/**
 * オボンのみ専用のダメージ後回復処理（ログ抑制版）
 */
function processPostDamageHealingOranOnly(hpAfterDamage, maxHP, moveDataList, turnIndex, berryUsed, probability, results, hpInfo) {
    
    if (hpAfterDamage <= 0) {
        return;
    }
    
    let finalHP = hpAfterDamage;
    let healAmount = 0;
    
    // オボンのみ発動判定
    if (!berryUsed && hpAfterDamage <= Math.floor(maxHP / 2)) {
        healAmount = 30;
        finalHP = Math.min(hpAfterDamage + healAmount, maxHP);
        berryUsed = true;
    }
    
    // 定数ダメージ計算
    const constantDamage = calculateTotalConstantDamage(maxHP, defenderPokemon.types, turnIndex + 1);
    finalHP = Math.max(0, finalHP - constantDamage);
    
    if (finalHP <= 0) {
        const koThisTurn = probability;
        if (koThisTurn > 0) {
            for (let i = turnIndex; i < results.length; i++) {
                results[i] += koThisTurn;
            }
        }
        return;
    }
    
    // HP情報を記録
    if (hpInfo && !hpInfo[turnIndex]) {
        let healType;
        if (berryUsed && healAmount > 0) {
            healType = constantDamage > 0 ? 
                'オボンのみ(使用済み)+やどりぎ回復' : 'オボンのみ(使用済み)';
        } else {
            healType = healAmount > 0 ? 'やどりぎ回復のみ' : 'オボンのみ(未発動)';
        }
        
        hpInfo[turnIndex] = {
            beforeHeal: hpAfterDamage,
            afterHeal: finalHP,
            healAmount: healAmount,
            constantDamage: constantDamage,
            netHealing: healAmount - constantDamage,
            healType: healType,
            berryActivated: false,
            activationTurn: null,
            maxHP: maxHP
        };
    }
    
    // 次のターンへ
    calculateKORateWithSitrusBerryOranOnly(finalHP, maxHP, moveDataList, turnIndex + 1, berryUsed, probability, results, hpInfo);
}

/**
 * オボンのみ効果を考慮した瀕死率計算（理論計算版）
 */
function logOranBerryKOCalculationGeneric(defenderHP, moveDataList, basicKOResult, itemKOResult) {
    const defenderItem = defenderPokemon.item;
    if (!defenderItem || defenderItem.name !== 'オボンのみ') {
        return null;
    }
    
    console.log(`=== オボンのみ効果瀕死率計算 ===`);
    
    // 基本情報
    const maxHP = defenderHP;
    const halfHP = Math.floor(maxHP / 2);
    const oranThreshold = halfHP;
    
    console.log(`最大HP: ${maxHP}, オボン発動条件: HP ≤ ${oranThreshold}`);
    
    const maxTurns = Math.min(moveDataList.length, basicKOResult.rates.length);
    const correctedRates = [...basicKOResult.rates];
    
    // HP状態分布を追跡
    let hpStatesWithOranStatus = new Map();
    hpStatesWithOranStatus.set(maxHP, { probability: 1.0, oranUsed: false });
    
    console.log(`=== 各ターンのオボン発動可能性分析 ===`);
    
    for (let turn = 0; turn < maxTurns; turn++) {
        const moveData = moveDataList[turn];
        if (!moveData) continue;
        
        console.log(`--- ${turn + 1}ターン目 ---`);
        
        const minDamage = moveData.minDamage || 0;
        const maxDamage = moveData.maxDamage || 0;
        const minCritDamage = moveData.minCritDamage || minDamage * 1.5;
        const maxCritDamage = moveData.maxCritDamage || maxDamage * 1.5;
        const accuracy = moveData.accuracy || 1.0;
        
        console.log(`ダメージ範囲: ${minDamage}~${maxDamage}（通常）, ${Math.floor(minCritDamage)}~${Math.floor(maxCritDamage)}（急所）`);
        
        let turnKORate = 0;
        let oranActivationThisTurn = 0;
        const newHpStatesWithOranStatus = new Map();
        
        const criticalRate = getCriticalRate();
        const normalRate = 1 - criticalRate;
        
        // 各HP状態とオボン使用状況からのパターン計算
        for (const [currentHP, stateInfo] of hpStatesWithOranStatus.entries()) {
            if (currentHP <= 0 || stateInfo.probability <= 0) continue;
            
            const { probability: stateProb, oranUsed } = stateInfo;
            
            // 命中時の処理
            for (let i = 0; i < 16; i++) {
                // 通常ダメージパターン
                const normalDamage = Math.floor(minDamage + (maxDamage - minDamage) * i / 15);
                let hpAfterNormalDamage = currentHP - normalDamage;
                
                if (hpAfterNormalDamage <= 0) {
                    turnKORate += stateProb * normalRate * accuracy * (1/16);
                } else {
                    let finalHP = hpAfterNormalDamage;
                    let newOranUsed = oranUsed;
                    
                    if (!oranUsed && hpAfterNormalDamage <= oranThreshold && hpAfterNormalDamage > 0) {
                        finalHP = Math.min(hpAfterNormalDamage + 30, maxHP);
                        newOranUsed = true;
                        oranActivationThisTurn += stateProb * normalRate * accuracy * (1/16);
                    }
                    
                    const patternProb = stateProb * normalRate * accuracy * (1/16);
                    const key = `${finalHP}_${newOranUsed}`;
                    
                    if (!newHpStatesWithOranStatus.has(key)) {
                        newHpStatesWithOranStatus.set(key, { 
                            hp: finalHP, 
                            probability: 0, 
                            oranUsed: newOranUsed 
                        });
                    }
                    newHpStatesWithOranStatus.get(key).probability += patternProb;
                }
                
                // 急所ダメージパターン
                const critDamage = Math.floor(minCritDamage + (maxCritDamage - minCritDamage) * i / 15);
                let hpAfterCritDamage = currentHP - critDamage;
                
                if (hpAfterCritDamage <= 0) {
                    turnKORate += stateProb * criticalRate * accuracy * (1/16);
                } else {
                    let finalHP = hpAfterCritDamage;
                    let newOranUsed = oranUsed;
                    
                    if (!oranUsed && hpAfterCritDamage <= oranThreshold && hpAfterCritDamage > 0) {
                        finalHP = Math.min(hpAfterCritDamage + 30, maxHP);
                        newOranUsed = true;
                        oranActivationThisTurn += stateProb * criticalRate * accuracy * (1/16);
                    }
                    
                    const patternProb = stateProb * criticalRate * accuracy * (1/16);
                    const key = `${finalHP}_${newOranUsed}`;
                    
                    if (!newHpStatesWithOranStatus.has(key)) {
                        newHpStatesWithOranStatus.set(key, { 
                            hp: finalHP, 
                            probability: 0, 
                            oranUsed: newOranUsed 
                        });
                    }
                    newHpStatesWithOranStatus.get(key).probability += patternProb;
                }
            }
        }
        
        console.log(`${turn + 1}ターン目瀕死率: ${(turnKORate * 100).toFixed(3)}%`);
        console.log(`${turn + 1}ターン目オボン発動確率: ${(oranActivationThisTurn * 100).toFixed(3)}%`);
        
        correctedRates[turn] = turnKORate;
        
        // 次のターンへHP状態を更新
        hpStatesWithOranStatus.clear();
        for (const [key, stateInfo] of newHpStatesWithOranStatus.entries()) {
            hpStatesWithOranStatus.set(stateInfo.hp, {
                probability: stateInfo.probability,
                oranUsed: stateInfo.oranUsed
            });
        }
    }
    
    return correctedRates;
}

// ========================================
// IV-B. MISSING CORE CALCULATION FUNCTIONS
// ========================================

/**
 * 基本瀕死率計算（統合版）
 */
function calculateMultiTurnBasicKORateUnified(defenderHP, maxTurns, suppressLogs = false) {
    turnCommonInfoDisplayed.clear();
    const results = Array(maxTurns).fill(0);
    const calculationBasis = Array(maxTurns).fill(null);
    const remainingHPRanges = Array(maxTurns).fill(null);
    
    if (!suppressLogs) {
        console.log('=== 統合版基本瀕死率計算開始 ===');
    }
    
    // moveDataListを構築
    const moveDataList = [];
    for (let turn = 0; turn < maxTurns; turn++) {
        const move = turn === 0 ? currentMove : multiTurnMoves[turn];
        
        if (!move) {
            const firstMove = currentMove;
            if (firstMove) {
                const damageData = calculateMoveDamageRange(firstMove, turn);
                moveDataList.push(damageData);
            } else {
                moveDataList.push(null);
            }
            continue;
        }
        
        const damageData = calculateMoveDamageRange(move, turn);
        moveDataList.push(damageData);
    }
    
    // 計算根拠を設定
    for (let turn = 0; turn < maxTurns; turn++) {
        if (moveDataList[turn]) {
            const move = turn === 0 ? currentMove : multiTurnMoves[turn];
            const moveData = moveDataList[turn];
            
            const minDamage = moveData.minDamage || 0;
            const maxDamage = moveData.maxDamage || 0;
            const accuracy = moveData.accuracy || 1.0;
            
            const minCritDamage = moveData.minCritDamage || Math.floor(minDamage * 1.5);
            const maxCritDamage = moveData.maxCritDamage || Math.floor(maxDamage * 1.5);
            
            if (!suppressLogs) {
                console.log(`${turn + 1}ターン目計算根拠設定: ${move.name} ダメージ${minDamage}~${maxDamage} 急所${minCritDamage}~${maxCritDamage} 命中${Math.round(accuracy * 100)}%`);
            }
            
            let isMultiHit = false;
            if (move && move.class === 'multi_hit') {
                isMultiHit = true;
            }
            
            calculationBasis[turn] = {
                damageRange: `${minDamage}~${maxDamage}`,
                accuracy: Math.round(accuracy * 100),
                isMultiHit: isMultiHit,
                moveName: move ? move.name : 'unknown',
                statusEffects: []
            };
        }
    }
    
    // 連続技処理の判定
    const hasAnyMultiHit = moveDataList.some((moveData, index) => {
        const move = index === 0 ? currentMove : multiTurnMoves[index];
        return move && move.class === 'multi_hit';
    });
    
    const multiHitTurns = new Set();
    for (let turn = 0; turn < maxTurns; turn++) {
        const move = turn === 0 ? currentMove : multiTurnMoves[turn];
        if (move && move.class === 'multi_hit') {
            multiHitTurns.add(turn);
        }
    }
    
    const leechSeed2Select = document.getElementById('leechSeed2Select');
    const hasLeechSeedHeal = leechSeed2Select && leechSeed2Select.value !== 'none';
    
    if (hasAnyMultiHit) {
        if (!suppressLogs) {
            console.log('=== 連続技混在: 統合計算開始 ===');
        }
        
        if (hasLeechSeedHeal) {
            calculateKORateWithConstantDamage(defenderHP, defenderHP, moveDataList, 0, 1.0, results, null);
        } else {
            calculateMixedKORateProbability(defenderHP, moveDataList, 0, 0, 1.0, results);
        }
    } else {       
        if (hasLeechSeedHeal) {
            calculateKORateWithConstantDamage(defenderHP, defenderHP, moveDataList, 0, 1.0, results, null);
        } else {
            calculateKORateProbability(defenderHP, moveDataList, 0, 0, 1.0, results);
        }
    }
    
    return {
        rates: results,
        basis: calculationBasis,
        hpRanges: remainingHPRanges
    };
}

/**
 * 基本瀕死率計算（再帰版）
 */
function calculateKORateProbability(remainingHP, moveDataList, turnIndex, totalDamage, currentProbability, results) {
    if (turnIndex >= moveDataList.length) {
        return;
    }
    
    const moveData = moveDataList[turnIndex];
    if (!moveData) {
        calculateKORateProbability(remainingHP, moveDataList, turnIndex + 1, totalDamage, currentProbability, results);
        return;
    }
    
    const defenderItem = defenderPokemon.item;
    const isOranBerry = defenderItem && defenderItem.name === 'オボンのみ';
    
    const criticalRate = getCriticalRate();
    const normalRate = 1 - criticalRate;
    
    if (!isOranBerry && !turnCommonInfoDisplayed.has(turnIndex)) {
        console.log(`=== ${turnIndex + 1}ターン目 共通情報 ===`);
        console.log(`通常ダメージ範囲: ${moveData.minDamage}~${moveData.maxDamage}`);
        console.log(`急所ダメージ範囲: ${moveData.minCritDamage}~${moveData.maxCritDamage}`);
        console.log(`命中率: ${(moveData.accuracy * 100).toFixed(1)}%`);
        
        const criticalText = criticalRate === 1/8 ? '高い確率' : '通常';
        console.log(`急所率: ${(criticalRate * 100).toFixed(2)}% (${criticalText})`);
        console.log('--- 各HPパターンでの計算 ---');
        turnCommonInfoDisplayed.add(turnIndex);
    }
    
    const shouldLog = !isOranBerry && currentProbability >= 0.001;
    
    if (shouldLog) {
        // 通常ダメージで倒せるパターン数を計算
        let normalKOPatterns = 0;
        for (let i = 0; i < 16; i++) {
            const normalDamage = Math.floor(moveData.minDamage + (moveData.maxDamage - moveData.minDamage) * i / 15);
            if (normalDamage >= remainingHP) {
                normalKOPatterns++;
            }
        }
        
        // 急所ダメージで倒せるパターン数を計算
        let critKOPatterns = 0;
        for (let i = 0; i < 16; i++) {
            const critDamage = Math.floor(moveData.minCritDamage + (moveData.maxCritDamage - moveData.minCritDamage) * i / 15);
            if (critDamage >= remainingHP) {
                critKOPatterns++;
            }
        }
        
        console.log(`HP${remainingHP}に対する倒せるパターン: 通常${normalKOPatterns}/16, 急所${critKOPatterns}/16`);
    }
    
    // 命中時の処理
    const hitProbability = moveData.accuracy;
    if (hitProbability > 0) {
        // 通常ダメージパターン
        for (let i = 0; i < 16; i++) {
            const normalDamage = Math.floor(moveData.minDamage + (moveData.maxDamage - moveData.minDamage) * i / 15);
            const patternProbability = currentProbability * hitProbability * normalRate * (1/16);
            
            if (normalDamage >= remainingHP) {
                // 瀕死の場合、このターン以降すべてに確率を加算
                for (let j = turnIndex; j < results.length; j++) {
                    results[j] += patternProbability;
                }
            } else {
                // 生存の場合、次のターンに進む
                const newHP = remainingHP - normalDamage;
                calculateKORateProbability(newHP, moveDataList, turnIndex + 1, totalDamage + normalDamage, patternProbability, results);
            }
        }
        
        // 急所ダメージパターン
        for (let i = 0; i < 16; i++) {
            const critDamage = Math.floor(moveData.minCritDamage + (moveData.maxCritDamage - moveData.minCritDamage) * i / 15);
            const patternProbability = currentProbability * hitProbability * criticalRate * (1/16);
            
            if (critDamage >= remainingHP) {
                // 瀕死の場合、このターン以降すべてに確率を加算
                for (let j = turnIndex; j < results.length; j++) {
                    results[j] += patternProbability;
                }
            } else {
                // 生存の場合、次のターンに進む
                const newHP = remainingHP - critDamage;
                calculateKORateProbability(newHP, moveDataList, turnIndex + 1, totalDamage + critDamage, patternProbability, results);
            }
        }
    }
    
    // 外し時の処理
    const missProbability = 1 - hitProbability;
    if (missProbability > 0) {
        const patternProbability = currentProbability * missProbability;
        calculateKORateProbability(remainingHP, moveDataList, turnIndex + 1, totalDamage, patternProbability, results);
    }
}

/**
 * 混在技（連続技あり）の瀕死率計算
 */
function calculateMixedKORateProbability(remainingHP, moveDataList, turnIndex, totalDamage, currentProbability, results) {
    if (remainingHP <= 0) {
        for (let i = turnIndex; i < results.length; i++) {
            results[i] += currentProbability;
        }
        return;
    }
    
    if (turnIndex >= moveDataList.length) {
        return;
    }
    
    const moveData = moveDataList[turnIndex];
    if (!moveData) {
        calculateMixedKORateProbability(remainingHP, moveDataList, turnIndex + 1, totalDamage, currentProbability, results);
        return;
    }
    
    const move = turnIndex === 0 ? currentMove : multiTurnMoves[turnIndex];
    const hitProbability = moveData.accuracy;
    
    if (move && move.class === 'multi_hit') {
        // 連続技の処理
        calculateMultiHitKORateProbability(remainingHP, moveDataList, turnIndex, totalDamage, currentProbability, results);
    } else {
        // 通常技の処理
        const criticalRate = getCriticalRate();
        const normalRate = 1 - criticalRate;
        
        // 命中時の処理
        if (hitProbability > 0) {
            // 通常ダメージパターン
            for (let i = 0; i < 16; i++) {
                const normalDamage = Math.floor(moveData.minDamage + (moveData.maxDamage - moveData.minDamage) * i / 15);
                const patternProbability = currentProbability * hitProbability * normalRate * (1/16);
                
                if (normalDamage >= remainingHP) {
                    for (let j = turnIndex; j < results.length; j++) {
                        results[j] += patternProbability;
                    }
                } else {
                    const newHP = remainingHP - normalDamage;
                    calculateMixedKORateProbability(newHP, moveDataList, turnIndex + 1, totalDamage + normalDamage, patternProbability, results);
                }
            }
            
            // 急所ダメージパターン
            for (let i = 0; i < 16; i++) {
                const critDamage = Math.floor(moveData.minCritDamage + (moveData.maxCritDamage - moveData.minCritDamage) * i / 15);
                const patternProbability = currentProbability * hitProbability * criticalRate * (1/16);
                
                if (critDamage >= remainingHP) {
                    for (let j = turnIndex; j < results.length; j++) {
                        results[j] += patternProbability;
                    }
                } else {
                    const newHP = remainingHP - critDamage;
                    calculateMixedKORateProbability(newHP, moveDataList, turnIndex + 1, totalDamage + critDamage, patternProbability, results);
                }
            }
        }
        
        // 外し時の処理
        const missProbability = 1 - hitProbability;
        if (missProbability > 0) {
            const patternProbability = currentProbability * missProbability;
            calculateMixedKORateProbability(remainingHP, moveDataList, turnIndex + 1, totalDamage, patternProbability, results);
        }
    }
}

/**
 * 連続技の瀕死率計算
 */
function calculateMultiHitKORateProbability(remainingHP, moveDataList, turnIndex, totalDamage, currentProbability, results) {
    if (turnIndex >= moveDataList.length) {
        return;
    }
    
    const moveData = moveDataList[turnIndex];
    if (!moveData) {
        calculateMultiHitKORateProbability(remainingHP, moveDataList, turnIndex + 1, totalDamage, currentProbability, results);
        return;
    }
    
    // ★修正: オボンのみ持ちかどうかをチェック
    const defenderItem = defenderPokemon.item;
    const isOranBerry = defenderItem && defenderItem.name === 'オボンのみ';
    
    const criticalRate = getCriticalRate();
    const normalRate = 1 - criticalRate;
    
    // ★修正: オボンのみの場合は基本ログを抑制
    if (!isOranBerry) {
        // 通常の連続技ログ出力処理
        if (turnIndex === 0 && (currentMove.class === 'multi_hit' || currentMove.class === 'two_hit')) {
            if (!turnCommonInfoDisplayed.has(turnIndex)) {
                console.log(`=== ${turnIndex + 1}ターン目 共通情報 ===`);
                console.log(`通常ダメージ範囲: ${moveData.minDamage}~${moveData.maxDamage}`);
                console.log(`急所ダメージ範囲: ${moveData.minCritDamage}~${moveData.maxCritDamage}`);
                console.log(`命中率: ${(moveData.accuracy * 100).toFixed(1)}%`);
                
                const criticalText = criticalRate === 1/8 ? '高い確率' : '通常';
                console.log(`急所率: ${(criticalRate * 100).toFixed(2)}% (${criticalText})`);
                
                // 連続技の詳細情報
                if (currentMove.class === 'multi_hit') {
                    const hitCountSelect = document.getElementById('multiHitCount');
                    const selectedHitCount = hitCountSelect ? hitCountSelect.value : '2-5';
                    console.log(`連続技: ${currentMove.name} (${selectedHitCount}回)`);
                } else if (currentMove.class === 'two_hit') {
                    console.log(`連続技: ${currentMove.name} (2回)`);
                }
                
                console.log('--- 各HPパターンでの計算 ---');
                turnCommonInfoDisplayed.add(turnIndex);
            }
        }
    }
    
    // ★修正: 連続技計算処理はオボンのみに関係なく実行
    if (turnIndex === 0 && (currentMove.class === 'multi_hit' || currentMove.class === 'two_hit')) {
        // 連続技の計算処理
        const hitCountSelect = document.getElementById('multiHitCount');
        const selectedHitCount = hitCountSelect ? hitCountSelect.value : '2-5';
        
        if (currentMove.class === 'multi_hit' && selectedHitCount === '2-5') {
            // 2-5回連続技の処理
            const hitDistribution = [
                { hits: 2, probability: 3/8 },
                { hits: 3, probability: 3/8 },
                { hits: 4, probability: 1/8 },
                { hits: 5, probability: 1/8 }
            ];
            
            // ★修正: オボンのみでない場合のみログ出力
            if (!isOranBerry) {
                console.log(`=== 連続技統合計算: ${currentMove.name} ===`);
                console.log(`1発ダメージ: ${Math.floor(moveData.minDamage / 2)}~${Math.floor(moveData.maxDamage / 5)}, 対象HP: ${remainingHP}`);
            }
            
            let totalKOProb = 0;
            
            hitDistribution.forEach(({ hits, probability }) => {
                // 各回数での計算処理
                const singleMinDamage = Math.floor(moveData.minDamage / hits);
                const singleMaxDamage = Math.floor(moveData.maxDamage / hits);
                
                // 実際の瀕死計算
                let hitKOProb = 0;
                
                // 通常攻撃パターン
                const normalAttackProb = Math.pow(normalRate, hits);
                for (let totalNormalDamage = singleMinDamage * hits; totalNormalDamage <= singleMaxDamage * hits; totalNormalDamage++) {
                    if (totalNormalDamage >= remainingHP) {
                        hitKOProb += normalAttackProb / (singleMaxDamage - singleMinDamage + 1);
                    }
                }
                
                // 急所混合パターン（簡略化）
                for (let i = 1; i <= hits; i++) {
                    const critPatternProb = Math.pow(normalRate, hits - i) * Math.pow(criticalRate, i);
                    const critTotalMinDamage = singleMinDamage * (hits - i) + singleMinDamage * 2 * i;
                    const critTotalMaxDamage = singleMaxDamage * (hits - i) + singleMaxDamage * 2 * i;
                    
                    for (let critDamage = critTotalMinDamage; critDamage <= critTotalMaxDamage; critDamage++) {
                        if (critDamage >= remainingHP) {
                            hitKOProb += critPatternProb / (critTotalMaxDamage - critTotalMinDamage + 1);
                        }
                    }
                }
                
                const weightedKOProb = hitKOProb * probability;
                totalKOProb += weightedKOProb;
                
                // ★修正: オボンのみでない場合のみログ出力
                if (!isOranBerry) {
                    console.log(`${hits}回攻撃: 瀕死率${(hitKOProb * 100).toFixed(2)}% × 発生率${(probability * 100).toFixed(1)}% = ${(weightedKOProb * 100).toFixed(3)}%`);
                }
            });
            
            // ★修正: オボンのみでない場合のみログ出力
            if (!isOranBerry) {
                console.log(`総合瀕死率: ${(totalKOProb * 100).toFixed(3)}%`);
                console.log('===============================');
            }
            
        } else {
            // 通常技または2ターン目以降は既存の処理
            calculateKORateProbability(remainingHP, moveDataList, turnIndex, totalDamage, currentProbability, results);
        }
        
    } else {
        // 通常技または2ターン目以降は既存の処理
        calculateKORateProbability(remainingHP, moveDataList, turnIndex, totalDamage, currentProbability, results);
    }
}

/**
 * 連続技のダメージ処理
 */
function processMultiHitDamage(remainingHP, moveData, hitCount, probability, turnIndex, moveDataList, totalDamage, results) {
    const minDamage = moveData.minDamage || 0;
    const maxDamage = moveData.maxDamage || 0;
    const criticalRate = getCriticalRate();
    
    // 総ダメージ計算（簡略化）
    const totalMinDamage = minDamage * hitCount;
    const totalMaxDamage = maxDamage * hitCount;
    
    // 確定撃破の場合
    if (totalMinDamage >= remainingHP) {
        for (let i = turnIndex; i < results.length; i++) {
            results[i] += probability;
        }
        return;
    }
    
    // 確定耐えの場合
    if (totalMaxDamage < remainingHP) {
        const newHP = remainingHP - totalMinDamage;
        calculateMixedKORateProbability(newHP, moveDataList, turnIndex + 1, totalDamage + totalMinDamage, probability, results);
        return;
    }
    
    // 乱数計算（簡略化）
    let koRate = 0;
    let survivalRate = 0;
    let averageDamage = 0;
    
    for (let i = 0; i < 16; i++) {
        const damage = Math.floor(totalMinDamage + (totalMaxDamage - totalMinDamage) * i / 15);
        if (damage >= remainingHP) {
            koRate += 1/16;
        } else {
            survivalRate += 1/16;
            averageDamage += damage * (1/16);
        }
    }
    
    // 瀕死パターン
    if (koRate > 0) {
        const koProbability = probability * koRate;
        for (let i = turnIndex; i < results.length; i++) {
            results[i] += koProbability;
        }
    }
    
    // 生存パターン
    if (survivalRate > 0) {
        const surviveProbability = probability * survivalRate;
        const avgDamagePerSurvival = averageDamage / survivalRate;
        const newHP = remainingHP - Math.floor(avgDamagePerSurvival);
        calculateMixedKORateProbability(newHP, moveDataList, turnIndex + 1, totalDamage + avgDamagePerSurvival, surviveProbability, results);
    }
}

/**
 * 定数ダメージ（やどりぎ等）を含む瀕死率計算
 */
function calculateKORateWithConstantDamage(currentHP, maxHP, moveDataList, turnIndex, currentProbability, results, hpInfo) {
    if (currentHP <= 0) {
        for (let i = turnIndex; i < results.length; i++) {
            results[i] += currentProbability;
        }
        return;
    }
    
    if (turnIndex >= moveDataList.length) {
        return;
    }
    
    const moveData = moveDataList[turnIndex];
    if (!moveData) {
        calculateKORateWithConstantDamage(currentHP, maxHP, moveDataList, turnIndex + 1, currentProbability, results, hpInfo);
        return;
    }
    
    // 技によるダメージ計算（簡略化）
    const move = turnIndex === 0 ? currentMove : multiTurnMoves[turnIndex];
    const hitProbability = moveData.accuracy;
    
    if (hitProbability > 0) {
        // 平均ダメージで簡略計算
        const avgDamage = Math.floor((moveData.minDamage + moveData.maxDamage) / 2);
        
        if (avgDamage >= currentHP) {
            // 瀕死の場合
            const probability = currentProbability * hitProbability;
            for (let i = turnIndex; i < results.length; i++) {
                results[i] += probability;
            }
        } else {
            // 生存の場合
            let newHP = currentHP - avgDamage;
            
            // 定数ダメージ・回復の処理
            const constantDamage = getConstantDamage();
            const constantHeal = getConstantHeal();
            
            newHP = Math.max(0, Math.min(maxHP, newHP - constantDamage + constantHeal));
            
            const probability = currentProbability * hitProbability;
            calculateKORateWithConstantDamage(newHP, maxHP, moveDataList, turnIndex + 1, probability, results, hpInfo);
        }
    }
    
    // 外し時の処理
    const missProbability = 1 - hitProbability;
    if (missProbability > 0) {
        let newHP = currentHP;
        
        // 定数ダメージ・回復の処理
        const constantDamage = getConstantDamage();
        const constantHeal = getConstantHeal();
        
        newHP = Math.max(0, Math.min(maxHP, newHP - constantDamage + constantHeal));
        
        const probability = currentProbability * missProbability;
        calculateKORateWithConstantDamage(newHP, maxHP, moveDataList, turnIndex + 1, probability, results, hpInfo);
    }
}

/**
 * HPバー作成関数
 */
function createHPBar(minDamage, maxDamage, totalHP, keepDamage = false) {
    const maxDots = 48;
    
    // みがわり仮定かチェック
    const isSubstitute = document.getElementById('substituteCheck')?.checked || false;
    let currentHP = totalHP;
    let displayMaxHP = totalHP;
    
    if (isSubstitute) {
        currentHP = Math.floor(totalHP / 4);
        displayMaxHP = currentHP;
    } else {
        const currentHPInput = document.getElementById('defenderCurrentHP');
        if (currentHPInput && currentHPInput.value) {
            currentHP = parseInt(currentHPInput.value) || totalHP;
        }
        displayMaxHP = currentHP;
    }
    
    let displayMinDamage = minDamage;
    let displayMaxDamage = maxDamage;
    
    // 累積ダメージの計算
    if (keepDamage && damageHistory.length > 0) {
        const historyMin = damageHistory.reduce((sum, entry) => sum + entry.minDamage, 0);
        const historyMax = damageHistory.reduce((sum, entry) => sum + entry.maxDamage, 0);
        displayMinDamage = historyMin + minDamage;
        displayMaxDamage = historyMax + maxDamage;
    }
    
    // 定数ダメージを計算
    const constantDamage = getConstantDamage();
    const constantHeal = getConstantHeal();
    
    displayMinDamage += constantDamage;
    displayMaxDamage += constantDamage;
    
    // 回復効果を適用
    displayMinDamage = Math.max(0, displayMinDamage - constantHeal);
    displayMaxDamage = Math.max(0, displayMaxDamage - constantHeal);
    
    // ダメージ後の残りHP計算
    const remainHPAfterMinDamage = Math.max(0, currentHP - displayMinDamage);
    const remainHPAfterMaxDamage = Math.max(0, currentHP - displayMaxDamage);
    
    // HP割合計算
    const remainMinPercent = Math.round((remainHPAfterMinDamage / displayMaxHP) * 100);
    const remainMaxPercent = Math.round((remainHPAfterMaxDamage / displayMaxHP) * 100);
    
    // HPバーのドット数計算
    const remainMinDots = Math.floor((remainHPAfterMinDamage / displayMaxHP) * maxDots);
    const remainMaxDots = Math.floor((remainHPAfterMaxDamage / displayMaxHP) * maxDots);
    
    // HPバーの生成
    const dotPercentage = 100 / maxDots;
    const minDotPercent = remainMinDots * dotPercentage;
    const maxDotPercent = remainMaxDots * dotPercentage;
    
    function generateLayers() {
        let layers = '';
        
        if (remainMinDots >= 25 && remainMaxDots < 25) {
            layers += `<div style="height: 100%; width: ${maxDotPercent}%; background-color: #f8e038 !important; position: absolute; left: 0; top: 0; z-index: 10;"></div>`;
            const halfDotPercent = 24 * dotPercentage;
            layers += `<div style="height: 100%; width: ${halfDotPercent}%; background-color: #f8e038 !important; position: absolute; left: ${maxDotPercent}%; top: 0; z-index: 9;"></div>`;
            if (remainMinDots > 25) {
                const greenDotPercent = (remainMinDots - 25) * dotPercentage;
                layers += `<div style="height: 100%; width: ${greenDotPercent}%; background-color: #68d068 !important; position: absolute; left: ${50}%; top: 0; z-index: 8;"></div>`;
            }
        } else if (remainMaxDots >= 25 && remainMinDots < 25) {
            if (remainMaxDots < 50) {
                layers += `<div style="height: 100%; width: ${maxDotPercent}%; background-color: #f8e038 !important; position: absolute; left: 0; top: 0; z-index: 10;"></div>`;
            } else {
                layers += `<div style="height: 100%; width: 50%; background-color: #f8e038 !important; position: absolute; left: 0; top: 0; z-index: 10;"></div>`;
                const greenDotPercent = (remainMaxDots - 25) * dotPercentage;
                layers += `<div style="height: 100%; width: ${greenDotPercent}%; background-color: #68d068 !important; position: absolute; left: 50%; top: 0; z-index: 9;"></div>`;
            }
            if (remainMinDots > 0) {
                layers += `<div style="height: 100%; width: ${minDotPercent}%; background-color: #f04848 !important; position: absolute; left: 0; top: 0; z-index: 11;"></div>`;
            }
        } else if (remainMinDots >= 25 && remainMaxDots >= 25) {
            if (remainMinDots < 50) {
                layers += `<div style="height: 100%; width: ${minDotPercent}%; background-color: #f8e038 !important; position: absolute; left: 0; top: 0; z-index: 10;"></div>`;
            } else {
                layers += `<div style="height: 100%; width: 50%; background-color: #f8e038 !important; position: absolute; left: 0; top: 0; z-index: 10;"></div>`;
                const greenDotPercent = (remainMinDots - 25) * dotPercentage;
                layers += `<div style="height: 100%; width: ${greenDotPercent}%; background-color: #68d068 !important; position: absolute; left: 50%; top: 0; z-index: 9;"></div>`;
            }
            if (remainMaxDots > remainMinDots) {
                const diffDots = remainMaxDots - remainMinDots;
                const diffPercent = diffDots * dotPercentage;
                if (remainMaxDots < 50) {
                    layers += `<div style="height: 100%; width: ${diffPercent}%; background-color: #f8e038 !important; position: absolute; left: ${minDotPercent}%; top: 0; z-index: 8; opacity: 0.5;"></div>`;
                } else {
                    const greenDiffPercent = (remainMaxDots - 25) * dotPercentage - (remainMinDots - 25) * dotPercentage;
                    layers += `<div style="height: 100%; width: ${greenDiffPercent}%; background-color: #68d068 !important; position: absolute; left: ${50 + (remainMinDots - 25) * dotPercentage}%; top: 0; z-index: 8; opacity: 0.5;"></div>`;
                }
            }
        } else {
            layers += `<div style="height: 100%; width: ${minDotPercent}%; background-color: #f04848 !important; position: absolute; left: 0; top: 0; z-index: 10;"></div>`;
            if (remainMaxDots > remainMinDots) {
                const diffDots = remainMaxDots - remainMinDots;
                const diffPercent = diffDots * dotPercentage;
                layers += `<div style="height: 100%; width: ${diffPercent}%; background-color: #f04848 !important; position: absolute; left: ${minDotPercent}%; top: 0; z-index: 9; opacity: 0.5;"></div>`;
            }
        }
        
        return layers;
    }
    
    const layers = generateLayers();
    
    // HPバー表示文言の生成
    let hpDisplayText = '';
    if (displayMinDamage === displayMaxDamage) {
        // 固定ダメージの場合
        if (isSubstitute) {
            hpDisplayText = `みがわりHP: ${remainHPAfterMaxDamage}/${displayMaxHP} (${remainMaxPercent}%)`;
        } else {
            if (currentHP === totalHP) {
                hpDisplayText = `HP: ${remainHPAfterMaxDamage}/${currentHP} (${remainMaxPercent}%)`;
            } else {
                hpDisplayText = `HP: ${remainHPAfterMaxDamage}/${currentHP} (現在HPから${remainMaxPercent}%)`;
            }
        }
    } else {
        // 乱数ダメージの場合
        if (isSubstitute) {
            hpDisplayText = `みがわりHP: ${remainHPAfterMaxDamage}~${remainHPAfterMinDamage}/${displayMaxHP} (${remainMaxPercent}%~${remainMinPercent}%)`;
        } else {
            if (currentHP === totalHP) {
                hpDisplayText = `HP: ${remainHPAfterMaxDamage}~${remainHPAfterMinDamage}/${currentHP} (${remainMaxPercent}%~${remainMinPercent}%)`;
            } else {
                hpDisplayText = `HP: ${remainHPAfterMaxDamage}~${remainHPAfterMinDamage}/${currentHP} (現在HPから${remainMaxPercent}%~${remainMinPercent}%)`;
            }
        }
    }
    
    return `
        <div class="hp-bar-container">
            <div class="hp-bar-background">
                <div class="hp-bar" style="position: relative; height: 100%;">
                    ${layers}
                </div>
            </div>
            <div class="hp-display-text">${hpDisplayText}</div>
        </div>
    `;
}

/**
 * 不足している重要なヘルパー関数
 */

// ターン情報表示管理用
let turnCommonInfoDisplayed = new Set();

/**
 * 急所率を取得する（ピントレンズ持ちの時のみ高い確率）
 */
function getCriticalRate() {
    // 基本急所率は1/16
    let criticalRate = 1/16;
    
    // ピントレンズを持っている場合は急所率が1段階上昇（1/8）
    if (attackerPokemon.item && attackerPokemon.item.name === 'ピントレンズ') {
        criticalRate = 1/8;
    }
    
    return criticalRate;
}

/**
 * 連続技のヒット回数確率を取得する
 */
function getMultiHitRates() {
    return {
        2: 0.375,  // 3/8
        3: 0.375,  // 3/8
        4: 0.125,  // 1/8
        5: 0.125   // 1/8
    };
}

/**
 * 定数ダメージを取得する（やどりぎのタネ、すなあらし等）
 */
function getConstantDamage() {
    let totalDamage = 0;
    
    // やどりぎのタネ
    const leechSeedSelect = document.getElementById('leechSeedSelect');
    if (leechSeedSelect && leechSeedSelect.value !== 'none') {
        const defenderHP = parseInt(document.getElementById('defenderRealHP')?.value) || 0;
        totalDamage += Math.floor(defenderHP / 8);
    }
    
    // すなあらし
    const sandstormCheck = document.getElementById('sandstormCheck');
    if (sandstormCheck && sandstormCheck.checked) {
        const defenderHP = parseInt(document.getElementById('defenderRealHP')?.value) || 0;
        totalDamage += Math.floor(defenderHP / 16);
    }
    
    return totalDamage;
}

/**
 * 定数回復を取得する（たべのこし等）
 */
function getConstantHeal() {
    let totalHeal = 0;
    
    // たべのこし
    const defenderItem = defenderPokemon.item;
    if (defenderItem && defenderItem.name === 'たべのこし') {
        const defenderHP = parseInt(document.getElementById('defenderRealHP')?.value) || 0;
        totalHeal += Math.floor(defenderHP / 16);
    }
    
    return totalHeal;
}

/**
 * 確定n発・乱数n発計算のメイン関数
 */
function calculateFixedAndRandomHits(minDamage, maxDamage, targetHP, accuracy = 1.0) {
    // 確定n発の計算
    let fixedHits = null;
    if (minDamage > 0) {
        fixedHits = Math.ceil(targetHP / minDamage);
    }
    
    // 乱数n発の計算
    let randomHits = null;
    if (maxDamage >= targetHP) {
        // 1発で倒せる可能性がある場合
        randomHits = 1;
    } else if (maxDamage > 0) {
        // 2発以上必要な場合の期待値計算
        randomHits = Math.ceil(targetHP / maxDamage);
    }
    
    return {
        fixed: fixedHits,
        random: randomHits,
        fixedText: fixedHits ? `確定${fixedHits}発` : null,
        randomText: randomHits ? `乱数${randomHits}発` : null
    };
}

/**
 * 乱数レベルを判定する関数
 */
function getRandomLevel(successRate) {
    if (successRate >= 93.75) {
        return "超高乱数";
    } else if (successRate >= 75.0) {
        return "高乱数";
    } else if (successRate >= 62.5) {
        return "中高乱数";
    } else if (successRate >= 37.5) {
        return "中乱数";
    } else if (successRate >= 25.0) {
        return "中低乱数";
    } else if (successRate >= 6.25) {
        return "低乱数";
    } else {
        return "超低乱数";
    }
}

/**
 * 1発での瀕死確率を計算する
 */
function calculateOneHitKORate(minDamage, maxDamage, targetHP) {
    if (maxDamage < targetHP) {
        return 0; // 1発では倒せない
    }
    
    if (minDamage >= targetHP) {
        return 100; // 確定1発
    }
    
    // 乱数1発の確率計算
    const successfulRange = maxDamage - Math.max(minDamage, targetHP) + 1;
    const totalRange = maxDamage - minDamage + 1;
    const successRate = (successfulRange / totalRange) * 100;
    
    return successRate;
}

/**
 * 純粋な連続技瀕死率計算（固定ヒット回数）
 */
function calculatePureFixedHitKORate(singleMinDamage, singleMaxDamage, hitCount, targetHP) {
    const totalMinDamage = singleMinDamage * hitCount;
    const totalMaxDamage = singleMaxDamage * hitCount;
    
    // 確定の場合
    if (totalMinDamage >= targetHP) {
        return 100.0;
    }
    
    // 確定耐えの場合
    if (totalMaxDamage < targetHP) {
        return 0.0;
    }
    
    // 乱数計算（簡略化）
    let successfulPatterns = 0;
    const totalPatterns = Math.pow(16, hitCount);
    
    // 各パターンの組み合わせを計算（簡略化のため近似）
    for (let i = 0; i < 100; i++) {
        let totalDamage = 0;
        for (let hit = 0; hit < hitCount; hit++) {
            const damageIndex = Math.floor(Math.random() * 16);
            const damage = Math.floor(singleMinDamage + (singleMaxDamage - singleMinDamage) * damageIndex / 15);
            totalDamage += damage;
        }
        if (totalDamage >= targetHP) {
            successfulPatterns++;
        }
    }
    
    return successfulPatterns; // 簡略化された確率
}


/**
 * 技のダメージ範囲を計算する（基本瀕死率計算用）
 */
function calculateMoveDamageRange(move, turnIndex = 0) {
    if (!move) return null;
    
    // ステータス計算
    const attackerStats = calculateStats(attackerPokemon);
    const defenderStats = calculateStats(defenderPokemon);
    
    // 攻撃値と防御値を決定
    const isPhysical = move.category === "Physical";
    const attackValue = isPhysical ? attackerStats.a : attackerStats.c;
    const defenseValue = isPhysical ? defenderStats.b : defenderStats.d;
    
    // ランク補正取得
    const atkRankElement = document.getElementById('attackerAtkRank');
    const defRankElement = document.getElementById('defenderDefRank');
    
    const atkRank = atkRankElement ? atkRankElement.value : '±0';
    const defRank = defRankElement ? defRankElement.value : '±0';
    
    // 威力計算
    let movePower = move.power || 0;
    if (move.class === 'pinch_up' || move.class === 'pinch_down') {
        movePower = calculatePower(move);
    }

    // 防御側のアイテムのみを一時的に無効化
    const originalDefenderItem = defenderPokemon.item;
    
    // 基本瀕死率計算時は防御側アイテム効果のみを除外
    defenderPokemon.item = null;
    // 攻撃側のアイテムはそのまま維持
    
    const [baseDamageMin, baseDamageMax] = calculateDamage(
        attackValue,
        defenseValue,
        attackerPokemon.level,
        movePower,
        move.category,
        move.type,
        attackerPokemon.types,
        defenderPokemon.types,
        atkRank,
        defRank
    );
    
    // 防御側アイテムのみを元に戻す
    defenderPokemon.item = originalDefenderItem;
    
    // 1発分のダメージを返す
    let minDamage = baseDamageMin;
    let maxDamage = baseDamageMax;
    
    // 急所ダメージ計算（防御側アイテム効果なし）
    defenderPokemon.item = null; // 一時的にアイテム無効化
    
    const criticalCheckbox = document.getElementById('criticalCheck');
    const originalCritical = criticalCheckbox ? criticalCheckbox.checked : false;
    if (criticalCheckbox) {
        criticalCheckbox.checked = true;
    }
    
    const [baseCritDamageMin, baseCritDamageMax] = calculateDamage(
        attackValue,
        defenseValue,
        attackerPokemon.level,
        movePower,
        move.category,
        move.type,
        attackerPokemon.types,
        defenderPokemon.types,
        atkRank,
        defRank
    );
    
    // 元の状態に戻す
    if (criticalCheckbox) {
        criticalCheckbox.checked = originalCritical;
    }
    defenderPokemon.item = originalDefenderItem;
    
    let minCritDamage = baseCritDamageMin;
    let maxCritDamage = baseCritDamageMax;
    
    // 命中率計算
    let finalAccuracy;
    if (move.class === 'multi_hit') {
        finalAccuracy = multiHitCalculator.calculateAccuracy(move);
    } else {
        const weather = document.getElementById('weatherSelect') ? 
            document.getElementById('weatherSelect').value : 'none';
        
        if (move.accuracy === 0 || (weather === 'rain' && move.name === 'かみなり')) {
            finalAccuracy = 1.0;
        } else {
            let baseAccuracy = (move.accuracy || 100) / 100;
            
            if (document.getElementById('harikiriCheck')?.checked && isPhysical) {
                baseAccuracy *= 0.8;
            }
            
            if (originalDefenderItem && originalDefenderItem.name === 'ひかりのこな') {
                baseAccuracy *= 0.9;
            }
            
            const evasionRank = parseInt(document.getElementById('defenderEvasionRank')?.value) || 0;
            const evasionMultiplier = getRankMultiplier(evasionRank.toString());
            
            finalAccuracy = Math.min(1.0, baseAccuracy / evasionMultiplier);
        }
    }
    
    return {
        minDamage: minDamage,
        maxDamage: maxDamage,
        minCritDamage: minCritDamage,
        maxCritDamage: maxCritDamage,
        accuracy: finalAccuracy,
        move: move
    };
}

/**
 * 威力計算（ピンチ系技対応）
 */
function calculatePower(move) {
    if (!move) return 0;
    
    // 基本威力
    let power = move.power || 0;
    
    // きしかいせい・じたばた
    if (move.class === 'pinch_up') {
        const currentHP = parseInt(document.getElementById('pinchUp_currentHP')?.value) || 1;
        const maxHP = parseInt(document.getElementById('pinchUp_maxHP')?.value) || 100;
        const HPrate = Math.floor(currentHP * 48 / maxHP);
        
        if (HPrate >= 33) power = 20;
        else if (HPrate >= 17) power = 40;
        else if (HPrate >= 10) power = 80;
        else if (HPrate >= 5) power = 100;
        else if (HPrate >= 2) power = 150;
        else power = 200;
    }
    // ふんか・しおふき
    else if (move.class === 'pinch_down') {
        const currentHP = parseInt(document.getElementById('pinchDown_currentHP').value);
        const maxHP = parseInt(document.getElementById('pinchDown_maxHP').value);
        const pinchDownPower = Math.floor(150 * currentHP / maxHP);
        power = pinchDownPower;
    }
    // めざめるパワー
    else if (move.class === 'awaken_power') {
        power = calculateHiddenPowerBP();
    }
    
    return power;
}

// ========================================
// V. UI CONTROL & RENDERING
// ========================================

/**
 * 計算されたステータスを画面に表示する
 * @param {string} side - 'attacker' または 'defender'
 * @param {Object} stats - 計算されたステータス
 */
function displayStats(side, stats) {
    // メイン表示の更新（攻撃側：A,C / 防御側：H,B,D）
    if (side === 'attacker') {
        const attackerRealA = document.getElementById('attackerRealA');
        const attackerRealC = document.getElementById('attackerRealC');
        
        // updateValueSilentlyが利用可能な場合はそれを使用
        if (attackerRealA && attackerRealA.updateValueSilently) {
            attackerRealA.updateValueSilently(stats.a);
        } else if (attackerRealA) {
            attackerRealA.value = stats.a;
        }
        
        if (attackerRealC && attackerRealC.updateValueSilently) {
            attackerRealC.updateValueSilently(stats.c);
        } else if (attackerRealC) {
            attackerRealC.value = stats.c;
        }
    } else {
        const defenderRealHP = document.getElementById('defenderRealHP');
        const defenderRealB = document.getElementById('defenderRealB');
        const defenderRealD = document.getElementById('defenderRealD');
        
        // updateValueSilentlyが利用可能な場合はそれを使用
        if (defenderRealHP && defenderRealHP.updateValueSilently) {
            defenderRealHP.updateValueSilently(stats.hp);
        } else if (defenderRealHP) {
            defenderRealHP.value = stats.hp;
        }
        
        if (defenderRealB && defenderRealB.updateValueSilently) {
            defenderRealB.updateValueSilently(stats.b);
        } else if (defenderRealB) {
            defenderRealB.value = stats.b;
        }
        
        if (defenderRealD && defenderRealD.updateValueSilently) {
            defenderRealD.updateValueSilently(stats.d);
        } else if (defenderRealD) {
            defenderRealD.value = stats.d;
        }
    }
    
    // 詳細設定の実数値更新
    ['hp', 'a', 'b', 'c', 'd', 's'].forEach(stat => {
        const detailInput = document.getElementById(`${side}DetailReal${stat.toUpperCase()}`);
        if (detailInput) {
            if (detailInput.updateValueSilently) {
                detailInput.updateValueSilently(stats[stat]);
            } else {
                detailInput.value = stats[stat];
            }
        }
    });
    
    // ポケモン情報を表示
    const pokemon = side === 'attacker' ? attackerPokemon : defenderPokemon;
    const infoElement = document.getElementById(`${side}PokemonInfo`);
    if (infoElement && pokemon.name) {
        const typeText = pokemon.types.join('/');
        const statsText = `H${pokemon.baseStats.hp} A${pokemon.baseStats.a} B${pokemon.baseStats.b} C${pokemon.baseStats.c} D${pokemon.baseStats.d} S${pokemon.baseStats.s}`;
        infoElement.textContent = `${typeText} ${statsText}`;
        infoElement.style.display = 'block';
    }
}

/**
 * ステータス計算と表示を行う統合関数
 * @param {string} side - 'attacker' または 'defender'
 */
function updateStats(side) {
    const pokemon = side === 'attacker' ? attackerPokemon : defenderPokemon;
    
    if (!pokemon.name) {
        return; // ポケモンが選択されていない場合は何もしない
    }
    
    // 純粋な計算関数を使用してステータスを計算
    const stats = calculateStats(pokemon);
    
    // 計算結果を画面に表示
    displayStats(side, stats);
}

// (To be filled with other UI-related functions)

// ========================================
// VI. EVENT HANDLERS
// ========================================

/**
 * イベントリスナーを設定する
 */
function setupEventListeners() {
    // レベル変更時
    document.getElementById('attackerLevel').addEventListener('change', function() {
        attackerPokemon.level = parseInt(this.value) || 50;
        updateStats('attacker');
    });
    
    document.getElementById('defenderLevel').addEventListener('change', function() {
        defenderPokemon.level = parseInt(this.value) || 50;
        updateStats('defender');
    });
    
    // inputイベントも追加（スピンボタン対応）
    document.getElementById('attackerLevel').addEventListener('input', function() {
        attackerPokemon.level = parseInt(this.value) || 50;
        updateStats('attacker');
    });
    
    document.getElementById('defenderLevel').addEventListener('input', function() {
        defenderPokemon.level = parseInt(this.value) || 50;
        updateStats('defender');
    });
    
    // 性格変更時
    document.getElementById('attackerNature').addEventListener('change', () => selectNature('attacker'));
    document.getElementById('defenderNature').addEventListener('change', () => selectNature('defender'));
    
    // Event listeners setup completed
}

// ========================================
// VI-B. HELPER FUNCTIONS
// ========================================

/**
 * ドロップダウンアイテム作成
 */
function createDropdownItem(text, onClick) {
    const item = document.createElement('div');
    item.className = 'dropdown-item';
    item.textContent = text;
    item.addEventListener('click', onClick);
    return item;
}

/**
 * 簡易的な実数値管理オブジェクト（元ファイルのRealStatInputManagerの簡易版）
 */
const realStatManager = {
    updateInputLimits: function(side) {
        ['hp', 'a', 'b', 'c', 'd', 's'].forEach(stat => {
            updateRealStatInputLimits(side, stat);
        });
    }
};

/**
 * 個別ステータスの制限更新
 */
function updateRealStatInputLimits(side, stat) {
    const pokemon = side === 'attacker' ? attackerPokemon : defenderPokemon;
    if (!pokemon.name || !pokemon.baseStats[stat] || pokemon.baseStats[stat] === 0) {
        return;
    }
    
    const limits = calculateStatLimits(pokemon.baseStats[stat], pokemon.level, stat === 'hp');
    
    // メイン入力欄
    const mainId = `${side}Real${stat.toUpperCase()}`;
    const mainInput = document.getElementById(mainId);
    if (mainInput) {
        mainInput.setAttribute('min', limits.min);
        mainInput.setAttribute('max', limits.max);
    }
    
    // 詳細設定の実数値入力欄
    const detailId = `${side}DetailReal${stat.toUpperCase()}`;
    const detailInput = document.getElementById(detailId);
    if (detailInput) {
        detailInput.setAttribute('min', limits.min);
        detailInput.setAttribute('max', limits.max);
    }
}

/**
 * 現在のステータス実数値を計算（簡易版）
 */
function calculateCurrentStat(pokemon, stat) {
    const level = pokemon.level;
    
    if (stat === 'hp') {
        const base = pokemon.baseStats.hp * 2 + pokemon.ivValues.hp + Math.floor(pokemon.evValues.hp / 4);
        const levelCalc = Math.floor(base * level / 100);
        return levelCalc + level + 10;
    } else {
        const base = pokemon.baseStats[stat] * 2 + pokemon.ivValues[stat] + Math.floor(pokemon.evValues[stat] / 4);
        const levelCalc = Math.floor(base * level / 100);
        const beforeNature = levelCalc + 5;
        return Math.floor(beforeNature * pokemon.natureModifiers[stat]);
    }
}

/**
 * 最適な個体値・努力値を見つける（簡易版）
 */
function findOptimalStats(pokemon, stat, targetValue, baseStat, level) {
    // 簡易実装：基本的な調整のみ
    for (let iv = 31; iv >= 0; iv--) {
        for (let ev = 0; ev <= 252; ev += 4) {
            const calculatedStat = calculateStatWithParams(baseStat, level, iv, ev, pokemon.natureModifiers[stat], stat === 'hp');
            if (calculatedStat === targetValue) {
                return { iv, ev };
            }
        }
    }
    return null;
}

/**
 * 結果が有効かチェック（簡易版）
 */
function isValidResult(result, targetValue, baseStat, level, isHP) {
    if (!result) return false;
    const actualStat = calculateStatWithParams(baseStat, level, result.iv, result.ev, result.natureMod || 1.0, isHP);
    return actualStat === targetValue;
}

/**
 * 個体値・努力値入力欄を更新（簡易版）
 */
function updateIVEVInputs(side, stat, iv, ev) {
    const statUpper = stat.toUpperCase();
    
    // メイン画面
    const mainIV = document.getElementById(`${side}Iv${statUpper}`);
    const mainEV = document.getElementById(`${side}Ev${statUpper}`);
    if (mainIV) mainIV.value = iv;
    if (mainEV) mainEV.value = ev;
    
    // 詳細画面
    const detailIV = document.getElementById(`${side}DetailIv${statUpper}`);
    const detailEV = document.getElementById(`${side}DetailEv${statUpper}`);
    if (detailIV) detailIV.value = iv;
    if (detailEV) detailEV.value = ev;
}

/**
 * めざめるパワー関連の実装
 */
function calculateHiddenPowerType() {
    // 攻撃側ポケモンの個体値を取得
    const ivs = {
        hp: parseInt(document.getElementById('attackerDetailIvHP')?.value || 31),
        a: parseInt(document.getElementById('attackerDetailIvA')?.value || 31),
        b: parseInt(document.getElementById('attackerDetailIvB')?.value || 31),
        c: parseInt(document.getElementById('attackerDetailIvC')?.value || 31),
        d: parseInt(document.getElementById('attackerDetailIvD')?.value || 31),
        s: parseInt(document.getElementById('attackerDetailIvS')?.value || 31)
    };
    
    // タイプ計算 (各個体値が奇数かどうか)
    let typeSum = 0;
    if (ivs.hp % 2 === 1) typeSum += 1;
    if (ivs.a % 2 === 1) typeSum += 2;
    if (ivs.b % 2 === 1) typeSum += 4;
    if (ivs.s % 2 === 1) typeSum += 8;
    if (ivs.c % 2 === 1) typeSum += 16;
    if (ivs.d % 2 === 1) typeSum += 32;
    
    const typeIndex = Math.floor(typeSum * 15 / 63);
    
    // タイプの対応表
    const typeTable = [
        'かくとう', // 0
        'ひこう',   // 1
        'どく',     // 2
        'じめん',   // 3
        'いわ',     // 4
        'むし',     // 5
        'ゴースト', // 6
        'はがね',   // 7
        'ほのお',   // 8
        'みず',     // 9
        'くさ',     // 10
        'でんき',   // 11
        'エスパー', // 12
        'こおり',   // 13
        'ドラゴン', // 14
        'あく'      // 15
    ];
    
    return typeTable[typeIndex];
}


function calculateDefenderHiddenPowerType() {
    // 防御側ポケモンの個体値を取得
    const ivs = {
        hp: parseInt(document.getElementById('defenderDetailIvHP')?.value || 31),
        a: parseInt(document.getElementById('defenderDetailIvA')?.value || 31),
        b: parseInt(document.getElementById('defenderDetailIvB')?.value || 31),
        c: parseInt(document.getElementById('defenderDetailIvC')?.value || 31),
        d: parseInt(document.getElementById('defenderDetailIvD')?.value || 31),
        s: parseInt(document.getElementById('defenderDetailIvS')?.value || 31)
    };
    
    // タイプ計算 (各個体値が奇数かどうか)
    let typeSum = 0;
    if (ivs.hp % 2 === 1) typeSum += 1;
    if (ivs.a % 2 === 1) typeSum += 2;
    if (ivs.b % 2 === 1) typeSum += 4;
    if (ivs.s % 2 === 1) typeSum += 8;
    if (ivs.c % 2 === 1) typeSum += 16;
    if (ivs.d % 2 === 1) typeSum += 32;
    
    const typeIndex = Math.floor(typeSum * 15 / 63);
    
    // タイプの対応表
    const typeTable = [
        'かくとう', 'ひこう', 'どく', 'じめん', 'いわ', 'むし', 'ゴースト', 'はがね',
        'ほのお', 'みず', 'くさ', 'でんき', 'エスパー', 'こおり', 'ドラゴン', 'あく'
    ];
    
    return typeTable[typeIndex];
}

/**
 * 攻撃側のめざめるパワー威力計算
 */
function calculateHiddenPowerBP() {
    // 攻撃側ポケモンの個体値を取得
    const ivs = {
        hp: parseInt(document.getElementById('attackerDetailIvHP')?.value || 31),
        a: parseInt(document.getElementById('attackerDetailIvA')?.value || 31),
        b: parseInt(document.getElementById('attackerDetailIvB')?.value || 31),
        c: parseInt(document.getElementById('attackerDetailIvC')?.value || 31),
        d: parseInt(document.getElementById('attackerDetailIvD')?.value || 31),
        s: parseInt(document.getElementById('attackerDetailIvS')?.value || 31)
    };
    
    // 威力計算 (各個体値を4で割った余りが2以上かどうか)
    let powerSum = 0;
    if (ivs.hp % 4 >= 2) powerSum += 1;
    if (ivs.a % 4 >= 2) powerSum += 2;
    if (ivs.b % 4 >= 2) powerSum += 4;
    if (ivs.s % 4 >= 2) powerSum += 8;
    if (ivs.c % 4 >= 2) powerSum += 16;
    if (ivs.d % 4 >= 2) powerSum += 32;
    
    const power = Math.floor(powerSum * 40 / 63) + 30;
    return power;
}

/**
 * 防御側のめざめるパワー威力計算
 */
function calculateDefenderHiddenPowerBP() {
    // 防御側ポケモンの個体値を取得
    const ivs = {
        hp: parseInt(document.getElementById('defenderDetailIvHP')?.value || 31),
        a: parseInt(document.getElementById('defenderDetailIvA')?.value || 31),
        b: parseInt(document.getElementById('defenderDetailIvB')?.value || 31),
        c: parseInt(document.getElementById('defenderDetailIvC')?.value || 31),
        d: parseInt(document.getElementById('defenderDetailIvD')?.value || 31),
        s: parseInt(document.getElementById('defenderDetailIvS')?.value || 31)
    };
    
    // 威力計算 (各個体値を4で割った余りが2以上かどうか)
    let powerSum = 0;
    if (ivs.hp % 4 >= 2) powerSum += 1;
    if (ivs.a % 4 >= 2) powerSum += 2;
    if (ivs.b % 4 >= 2) powerSum += 4;
    if (ivs.s % 4 >= 2) powerSum += 8;
    if (ivs.c % 4 >= 2) powerSum += 16;
    if (ivs.d % 4 >= 2) powerSum += 32;
    
    const power = Math.floor(powerSum * 40 / 63) + 30;
    return power;
}


function getGen3CategoryByType(type) {
    // 第3世代のタイプ別分類（簡易実装）
    const physicalTypes = ['ノーマル', 'かくとう', 'どく', 'じめん', 'ひこう', 'むし', 'いわ', 'ゴースト', 'はがね'];
    return physicalTypes.includes(type) ? 'Physical' : 'Special';
}

/**
 * ウェザーボール関連の実装
 */
function getWeatherBallTypeAndCategory() {
    const weather = document.getElementById('weatherSelect')?.value || 'none';
    switch (weather) {
        case 'sunny': return { type: 'ほのお', category: 'Special' };
        case 'rain': return { type: 'みず', category: 'Special' };
        case 'sandstorm': return { type: 'いわ', category: 'Physical' };
        case 'hail': return { type: 'こおり', category: 'Special' };
        default: return { type: 'ノーマル', category: 'Special' };
    }
}

/**
 * HP値更新関連の実装
 */
function updatePinchHPValues() {
    // 簡易実装：攻撃側のHP実数値を取得してピンチ系入力欄に設定
    const attackerHP = parseInt(document.getElementById('attackerDetailRealHP')?.value) || 0;
    if (attackerHP > 0) {
        const pinchMaxHP = document.getElementById('pinchUp_maxHP');
        const pinchCurrentHP = document.getElementById('pinchUp_currentHP');
        if (pinchMaxHP) pinchMaxHP.value = attackerHP;
        if (pinchCurrentHP) pinchCurrentHP.value = Math.floor(attackerHP / 4); // 仮の値
    }
}

/**
 * 性格ドロップダウン関連の実装
 */
function showNatureList(dropdown, input, side) {
    dropdown.innerHTML = '';
    
    const rect = input.getBoundingClientRect();
    dropdown.style.top = (rect.bottom + window.scrollY) + 'px';
    dropdown.style.left = (rect.left + window.scrollX) + 'px';
    dropdown.style.width = rect.width + 'px';
    
    natureDataList.forEach(nature => {
        const item = createDropdownItem(nature.name, () => {
            input.value = nature.name;
            dropdown.style.display = 'none';
            selectNature(side);
        });
        dropdown.appendChild(item);
    });
    
    dropdown.style.display = 'block';
}

function filterNatureList(searchText, dropdown, input, side) {
    if (!searchText) {
        dropdown.style.display = 'none';
        return;
    }
    
    dropdown.innerHTML = '';
    
    const filtered = natureDataList.filter(nature => 
        nature.name.includes(searchText)
    );
    
    filtered.forEach(nature => {
        const item = createDropdownItem(nature.name, () => {
            input.value = nature.name;
            dropdown.style.display = 'none';
            selectNature(side);
        });
        dropdown.appendChild(item);
    });
    
    const rect = input.getBoundingClientRect();
    dropdown.style.top = (rect.bottom + window.scrollY) + 'px';
    dropdown.style.left = (rect.left + window.scrollX) + 'px';
    dropdown.style.width = rect.width + 'px';
    
    dropdown.style.display = filtered.length > 0 ? 'block' : 'none';
}

function checkExactNatureMatch(inputText, side) {
    if (!inputText) return;
    
    const exactMatch = natureDataList.find(nature => nature.name === inputText);
    if (exactMatch) {
        selectNature(side);
    }
}

// ========================================
// VII. UTILITIES
// ========================================

/**
 * ランク値に対応するステータス倍率を取得する純粋な関数
 * @param {number|string} rankValue - ランク値 (-6 ～ +6)
 * @returns {number} ステータス倍率
 */
function getRankMultiplier(rankValue) {
    const multipliers = {
        '-6': { numerator: 10, denominator: 40 },
        '-5': { numerator: 10, denominator: 35 },
        '-4': { numerator: 10, denominator: 30 },
        '-3': { numerator: 10, denominator: 25 },
        '-2': { numerator: 10, denominator: 20 },
        '-1': { numerator: 10, denominator: 15 },
        '±0':  { numerator: 10, denominator: 10 },
        '+1':  { numerator: 15, denominator: 10 },
        '+2':  { numerator: 20, denominator: 10 },
        '+3':  { numerator: 25, denominator: 10 },
        '+4':  { numerator: 30, denominator: 10 },
        '+5':  { numerator: 35, denominator: 10 },
        '+6':  { numerator: 40, denominator: 10 }
    };
    
    const mult = multipliers[rankValue.toString()];
    return mult ? mult.numerator / mult.denominator : 1.0;
}

/**
 * 命中・回避ランクの倍率を取得
 */
function getAccuracyMultiplier(rank) {
    const multipliers = {
        '-6': { numerator: 10, denominator: 40 },
        '-5': { numerator: 10, denominator: 35 },
        '-4': { numerator: 10, denominator: 30 },
        '-3': { numerator: 10, denominator: 25 },
        '-2': { numerator: 10, denominator: 20 },
        '-1': { numerator: 10, denominator: 15 },
        '±0':  { numerator: 10, denominator: 10 },
        '+1':  { numerator: 15, denominator: 10 },
        '+2':  { numerator: 20, denominator: 10 },
        '+3':  { numerator: 25, denominator: 10 },
        '+4':  { numerator: 30, denominator: 10 },
        '+5':  { numerator: 35, denominator: 10 },
        '+6':  { numerator: 40, denominator: 10 }
    };
    
    const mult = multipliers[rank.toString()];
    return mult ? mult.numerator / mult.denominator : 1.0;
}

// ========================================
// VI. FIGY BERRY CALCULATIONS  
// ========================================

/**
 * フィラのみ系アイテムの判定
 */
function isFigyBerry(itemName) {
   return ['フィラのみ', 'ウイのみ', 'マゴのみ', 'バンジのみ', 'イアのみ'].includes(itemName);
}

/**
 * フィラのみ系での瀕死率計算
 */
function calculateKORateWithFigyBerry(currentHP, maxHP, moveDataList, turnIndex, berryUsed, currentProbability, results, hpInfo) {
    if (currentHP <= 0) {
        for (let i = turnIndex; i < results.length; i++) {
            results[i] += currentProbability;
        }
        return;
    }
    
    if (turnIndex >= moveDataList.length) {
        return;
    }
    
    const moveData = moveDataList[turnIndex];
    if (!moveData) {
        // ターン終了時の定数ダメージ処理
        const constantDamage = getConstantDamage();
        const finalHP = Math.max(0, currentHP - constantDamage);
        const berryName = defenderPokemon.item ? defenderPokemon.item.name : 'フィラ系きのみ';
        
        if (hpInfo) {
            hpInfo[turnIndex] = {
                beforeHeal: currentHP,
                afterHeal: finalHP,
                healAmount: 0,
                constantDamage: constantDamage,
                netHealing: -constantDamage,
                healType: berryUsed ? `${berryName}(使用済み)` : `${berryName}(未発動)`,
                maxHP: maxHP,
                berryActivated: false
            };
        }
        
        calculateKORateWithFigyBerry(finalHP, maxHP, moveDataList, turnIndex + 1, berryUsed, currentProbability, results, hpInfo);
        return;
    }
    
    // 技が外れた場合
    const missProbability = 1 - moveData.accuracy;
    if (missProbability > 0) {
        const constantDamage = getConstantDamage();
        const finalHP = Math.max(0, currentHP - constantDamage);
        calculateKORateWithFigyBerry(finalHP, maxHP, moveDataList, turnIndex + 1, berryUsed, currentProbability * missProbability, results, hpInfo);
    }
    
    // 技が命中した場合の処理
    const hitProbability = moveData.accuracy;
    
    if (hitProbability > 0) {
        let totalKOProbability = 0;
        
        // 全16パターンの通常ダメージを個別計算
        for (let i = 0; i < 16; i++) {
            const normalDamage = Math.floor(moveData.minDamage + (moveData.maxDamage - moveData.minDamage) * i / 15);
            const normalPatternProb = (1/16) * (15/16);
            
            // ★重要：瀞死判定は攻撃ダメージのみで行う
            if (normalDamage >= currentHP) {
                totalKOProbability += normalPatternProb;
            } else {
                const hpAfterDamage = currentHP - normalDamage;
                const surviveProb = currentProbability * hitProbability * normalPatternProb;
                processPostDamageFigyHealingFixed(hpAfterDamage, maxHP, berryUsed, surviveProb, turnIndex, moveDataList, results, hpInfo);
            }
        }
        
        // 全16パターンの急所ダメージを個別計算
        for (let i = 0; i < 16; i++) {
            const critDamage = Math.floor(moveData.minCritDamage + (moveData.maxCritDamage - moveData.minCritDamage) * i / 15);
            const critPatternProb = (1/16) * (1/16);
            
            // ★重要：瀞死判定は攻撃ダメージのみで行う
            if (critDamage >= currentHP) {
                totalKOProbability += critPatternProb;
            } else {
                const hpAfterDamage = currentHP - critDamage;
                const surviveProb = currentProbability * hitProbability * critPatternProb;
                processPostDamageFigyHealingFixed(hpAfterDamage, maxHP, berryUsed, surviveProb, turnIndex, moveDataList, results, hpInfo);
            }
        }
        
        // このターンで瀞死する確率を結果に加算
        const koThisTurn = currentProbability * hitProbability * totalKOProbability;
        if (koThisTurn > 0) {
            for (let i = turnIndex; i < results.length; i++) {
                results[i] += koThisTurn;
            }
        }
    }
}

/**
 * フィラのみ系回復処理
 */
function processPostDamageFigyHealingFixed(hpAfterDamage, maxHP, berryUsed, probability, turnIndex, moveDataList, results, hpInfo) {
    // ★重要: 攻撃ダメージで瀕死になった場合はフィラ系きのみは発動しない
    if (hpAfterDamage <= 0) {
        // 瀕死の場合はアイテム効果なし
        for (let i = turnIndex; i < results.length; i++) {
            results[i] += probability;
        }
        return;
    }
    
    // 生存している場合のみフィラ系きのみ発動チェック
    if (!berryUsed && hpAfterDamage > 0 && hpAfterDamage <= maxHP / 2) {
        const healAmount = Math.floor(maxHP / 8);
        let healedHP = Math.min(hpAfterDamage + healAmount, maxHP);
        
        // やどりぎ回復量を追加
        let additionalHeal = 0;
        const leechSeed2Select = document.getElementById('leechSeed2Select');
        if (leechSeed2Select) {
            const leechSeed2StartTurn = parseInt(leechSeed2Select.value);
            if (!isNaN(leechSeed2StartTurn) && turnIndex + 1 >= leechSeed2StartTurn) {
                additionalHeal = calculateLeechSeed2HealAmount(maxHP);
                healedHP = Math.min(healedHP + additionalHeal, maxHP);
            }
        }
        
        const constantDamage = getConstantDamage();
        const finalHP = Math.max(0, healedHP - constantDamage);
        const totalHealAmount = healAmount + additionalHeal;
        const netHealing = totalHealAmount - constantDamage;
        const berryName = defenderPokemon.item ? defenderPokemon.item.name : 'フィラ系きのみ';
        
        if (hpInfo) {
            hpInfo[turnIndex] = {
                beforeHeal: hpAfterDamage,
                afterHeal: finalHP,
                healAmount: totalHealAmount,
                constantDamage: constantDamage,
                netHealing: netHealing,
                healType: additionalHeal > 0 ? `${berryName}+やどりぎ回復` : berryName,
                berryActivated: true,
                activationTurn: turnIndex + 1,
                maxHP: maxHP
            };
        }
        
        calculateKORateWithFigyBerry(finalHP, maxHP, moveDataList, turnIndex + 1, true, probability, results, hpInfo);
    } else {
        // やどりぎ回復のみチェック
        let healAmount = 0;
        const leechSeed2Select = document.getElementById('leechSeed2Select');
        if (leechSeed2Select) {
            const leechSeed2StartTurn = parseInt(leechSeed2Select.value);
            if (!isNaN(leechSeed2StartTurn) && turnIndex + 1 >= leechSeed2StartTurn) {
                healAmount = calculateLeechSeed2HealAmount(maxHP);
            }
        }
        
        const constantDamage = getConstantDamage();
        const finalHP = Math.max(0, hpAfterDamage + healAmount - constantDamage);
        const netHealing = healAmount - constantDamage;
        const berryName = defenderPokemon.item ? defenderPokemon.item.name : 'フィラ系きのみ';
        
        if (hpInfo && !hpInfo[turnIndex]) {
            let healType;
            if (berryUsed) {
                healType = healAmount > 0 ? `${berryName}(使用済み)+やどりぎ回復` : `${berryName}(使用済み)`;
            } else {
                healType = healAmount > 0 ? 'やどりぎ回復のみ' : `${berryName}(未発動)`;
            }
            
            hpInfo[turnIndex] = {
                beforeHeal: hpAfterDamage,
                afterHeal: finalHP,
                healAmount: healAmount,
                constantDamage: constantDamage,
                netHealing: netHealing,
                healType: healType,
                berryActivated: false,
                activationTurn: null,
                maxHP: maxHP
            };
        }
        
        calculateKORateWithFigyBerry(finalHP, maxHP, moveDataList, turnIndex + 1, berryUsed, probability, results, hpInfo);
    }
}

// ========================================
// VII. LEFTOVERS CALCULATIONS  
// ========================================

/**
 * たべのこし持ちでの瀕死率計算
 */
function calculateKORateWithLeftovers(currentHP, maxHP, moveDataList, turnIndex, currentProbability, results, hpInfo, berryUsed) {
    if (currentHP <= 0) {
        for (let i = turnIndex; i < results.length; i++) {
            results[i] += currentProbability;
        }
        return;
    }
    
    if (turnIndex >= moveDataList.length) {
        return;
    }
    
    const moveData = moveDataList[turnIndex];
    if (!moveData) {
        // ターン終了時の処理
        let healAmount = Math.floor(maxHP / 16); // たべのこし回復
        
        // やどりぎ回復を追加
        const leechSeed2Select = document.getElementById('leechSeed2Select');
        if (leechSeed2Select) {
            const leechSeed2StartTurn = parseInt(leechSeed2Select.value);
            if (!isNaN(leechSeed2StartTurn) && turnIndex + 1 >= leechSeed2StartTurn) {
                healAmount += calculateLeechSeed2HealAmount(maxHP);
            }
        }
        
        // 定数ダメージを計算
        const constantDamage = getConstantDamage();
        
        // 回復量から定数ダメージを差し引き
        const netHealing = healAmount - constantDamage;
        let finalHP = currentHP + netHealing;
        finalHP = Math.max(0, Math.min(finalHP, maxHP)); // 0以上、最大HP以下に制限
        
        if (hpInfo) {
            const healTypes = [];
            if (Math.floor(maxHP / 16) > 0) healTypes.push('たべのこし');
            if (leechSeed2Select && leechSeed2Select.value !== 'none' && turnIndex + 1 >= parseInt(leechSeed2Select.value)) {
                healTypes.push('やどりぎ回復');
            }
            
            hpInfo[turnIndex] = {
                beforeHeal: currentHP,
                afterHeal: finalHP,
                healAmount: healAmount,
                constantDamage: constantDamage,
                netHealing: netHealing,
                healType: healTypes.length > 0 ? healTypes.join('+') : '定数ダメージのみ',
                maxHP: maxHP
            };
        }
        
        calculateKORateWithLeftovers(finalHP, maxHP, moveDataList, turnIndex + 1, currentProbability, results, hpInfo, berryUsed);
        return;
    }
    
    // 技が外れた場合
    const missProbability = 1 - moveData.accuracy;
    if (missProbability > 0) {
        let healAmount = Math.floor(maxHP / 16); // たべのこし回復
        
        // やどりぎ回復を追加
        const leechSeed2Select = document.getElementById('leechSeed2Select');
        if (leechSeed2Select) {
            const leechSeed2StartTurn = parseInt(leechSeed2Select.value);
            if (!isNaN(leechSeed2StartTurn) && turnIndex + 1 >= leechSeed2StartTurn) {
                healAmount += calculateLeechSeed2HealAmount(maxHP);
            }
        }
        
        const constantDamage = getConstantDamage();
        const netHealing = healAmount - constantDamage;
        let finalHP = currentHP + netHealing;
        finalHP = Math.max(0, Math.min(finalHP, maxHP));
        
        calculateKORateWithLeftovers(finalHP, maxHP, moveDataList, turnIndex + 1, currentProbability * missProbability, results, hpInfo, berryUsed);
    }
    
    // 瀕死率計算
    processKORateCalculation(currentHP, maxHP, moveData, turnIndex, currentProbability, results, hpInfo, 
        (remainingHP, prob) => {
            // 瀕死になった場合はアイテム効果なし
            if (remainingHP <= 0) {
                for (let i = turnIndex; i < results.length; i++) {
                    results[i] += prob;
                }
                return;
            }
            
            let healAmount = Math.floor(maxHP / 16); // たべのこし回復
            
            // やどりぎ回復を追加
            const leechSeed2Select = document.getElementById('leechSeed2Select');
            if (leechSeed2Select) {
                const leechSeed2StartTurn = parseInt(leechSeed2Select.value);
                if (!isNaN(leechSeed2StartTurn) && turnIndex + 1 >= leechSeed2StartTurn) {
                    healAmount += calculateLeechSeed2HealAmount(maxHP);
                }
            }
            
            const constantDamage = getConstantDamage();
            const netHealing = healAmount - constantDamage;
            let finalHP = remainingHP + netHealing;
            finalHP = Math.max(0, Math.min(finalHP, maxHP));
            
            calculateKORateWithLeftovers(finalHP, maxHP, moveDataList, turnIndex + 1, prob, results, hpInfo, berryUsed);
        }
    );
}

/**
 * 共通の瀕死率計算処理
 */
function processKORateCalculation(currentHP, maxHP, moveData, turnIndex, currentProbability, results, hpInfo, onSurvive) {
    const hitProbability = moveData.accuracy;
    
    // 技が命中した場合の処理
    if (hitProbability > 0) {
        let totalKOProbability = 0;
        
        // 全16パターンの通常ダメージを個別計算
        for (let i = 0; i < 16; i++) {
            const normalDamage = Math.floor(moveData.minDamage + (moveData.maxDamage - moveData.minDamage) * i / 15);
            const normalPatternProb = (1/16) * (15/16); // 通常ダメージの各パターンの確率
            
            if (normalDamage >= currentHP) {
                // 通常ダメージで瀕死
                totalKOProbability += normalPatternProb;
            } else {
                // 通常ダメージで生存 - 個別に次ターンへ
                const remainingHP = Math.max(1, currentHP - normalDamage);
                const surviveProb = currentProbability * hitProbability * normalPatternProb;
                if (surviveProb > 0.0001) { // 極小確率はスキップ
                    onSurvive(remainingHP, surviveProb);
                }
            }
        }
        
        // 全16パターンの急所ダメージを個別計算
        for (let i = 0; i < 16; i++) {
            const critDamage = Math.floor(moveData.minCritDamage + (moveData.maxCritDamage - moveData.minCritDamage) * i / 15);
            const critPatternProb = (1/16) * (1/16); // 急所ダメージの各パターンの確率
            
            if (critDamage >= currentHP) {
                // 急所ダメージで瀕死
                totalKOProbability += critPatternProb;
            } else {
                // 急所ダメージで生存 - 個別に次ターンへ
                const remainingHP = Math.max(1, currentHP - critDamage);
                const surviveProb = currentProbability * hitProbability * critPatternProb;
                if (surviveProb > 0.0001) { // 極小確率はスキップ
                    onSurvive(remainingHP, surviveProb);
                }
            }
        }
        
        // このターンで瀕死する確率を結果に加算
        const koThisTurn = currentProbability * hitProbability * totalKOProbability;
        if (koThisTurn > 0) {
            for (let i = turnIndex; i < results.length; i++) {
                results[i] += koThisTurn;
            }
        }
    }
}

// ========================================
// VIII. MULTI-TURN MOVE MANAGEMENT
// ========================================

/**
 * 複数ターン技を追加
 */
function addMultiTurnMove() {
    const container = document.getElementById('multiTurnMovesContainer');
    const currentMoves = container.querySelectorAll('.multi-turn-move-row').length;
    const nextTurn = currentMoves + 2; // 1ターン目は通常の技欄なので+2
    
    if (nextTurn > 5) return; // 最大5ターンまで
    
    const moveRow = document.createElement('div');
    moveRow.className = 'multi-turn-move-row';
    moveRow.innerHTML = `
        <div class="input-row">
            <label class="inline-label">${nextTurn}ターン目:</label>
            <input type="text" id="multiTurnMove${nextTurn}" placeholder="技を検索">
        </div>
    `;
    
    container.appendChild(moveRow);
    
    // 新しい技入力欄のドロップダウンを設定
    setupMultiTurnMoveDropdown(`multiTurnMove${nextTurn}`, nextTurn - 1);
    
    // 5ターン目まで追加したら「＋技を追加する」ボタンを非表示
    if (nextTurn === 5) {
        document.getElementById('addMoveButton').style.display = 'none';
    }
}

/**
 * 複数ターン技設定をクリア
 */
function clearMultiTurnMoves() {
    // 配列をクリア
    multiTurnMoves = [null, null, null, null, null];
    
    // DOM要素もクリア
    const container = document.getElementById('multiTurnMovesContainer');
    if (container) {
        container.innerHTML = '';
    }
    
    // 追加ボタンを再表示
    const addButton = document.getElementById('addMoveButton');
    if (addButton) {
        addButton.style.display = 'block';
    }
}

/**
 * 複数ターン技が設定されているかチェック
 */
function hasMultiTurnMoves() {
    // 1. DOM入力欄の値をチェック（2-5ターン目）- 最優先
    let hasActualInputMoves = false;
    for (let i = 2; i <= 5; i++) {
        const input = document.getElementById(`multiTurnMove${i}`);
        if (input) {
            const value = input.value ? input.value.trim() : '';
            if (value !== '') {
                hasActualInputMoves = true;
                break;
            }
        }
    }
    
    // 2. multiTurnMoves配列内の技をチェック（ただし、自動設定技は除外）
    let hasActualMultiTurnMoves = hasActualInputMoves;
    if (!hasActualInputMoves) {
        // 現在の設定を確認
        const paralysisSelect = document.getElementById('paralysisSelect');
        const confusionSelect = document.getElementById('confusionSelect');
        const statusDamageSelect = document.getElementById('statusDamageSelect');
        const spikesLevel = parseInt(document.getElementById('spikesLevel')?.value) || 0;
        const weather = document.getElementById('weatherSelect')?.value;
        
        const paralysisValue = paralysisSelect ? paralysisSelect.value : 'none';
        const confusionValue = confusionSelect ? confusionSelect.value : 'none';
        const statusDamageValue = statusDamageSelect ? statusDamageSelect.value : 'none';
        
        const hasActionRestriction = (paralysisValue !== 'none' && paralysisValue !== '') || 
                                   (confusionValue !== 'none' && confusionValue !== '');
        const hasConstantDamage = statusDamageValue !== 'none' || spikesLevel > 0 || 
                                (weather === 'sandstorm' || weather === 'hail');
        
        // 自動設定が有効でない場合のみ配列をチェック
        if (!hasActionRestriction && !hasConstantDamage) {
            for (let i = 1; i < 5; i++) {
                if (multiTurnMoves[i] && multiTurnMoves[i].name && multiTurnMoves[i].name.trim() !== '') {
                    console.log(`multiTurnMoves[${i}]に技が設定されています:`, multiTurnMoves[i].name);
                    hasActualMultiTurnMoves = true;
                    break;
                }
            }
        }
    }
    
    return hasActualMultiTurnMoves;
}

/**
 * 複数ターン技用ドロップダウンのセットアップ
 */
function setupMultiTurnMoveDropdown(inputId, turnIndex) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    const dropdown = document.createElement('div');
    dropdown.className = 'pokemon-dropdown';
    dropdown.style.display = 'none';
    document.body.appendChild(dropdown);
    
    // クリック時
    input.addEventListener('click', function(e) {
        e.stopPropagation();
        this.value = '';
        showMoveListForTurn(dropdown, input, turnIndex);
    });
    
    // 入力時
    input.addEventListener('input', function() {
        filterMoveListForTurn(this.value, dropdown, input, turnIndex);
    });
    
    // フォーカスアウト時
    input.addEventListener('blur', function() {
        checkExactMoveMatchForTurn(this.value, turnIndex);
        dropdown.style.display = 'none';
    });
    
    // Enterキー押下時
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkExactMoveMatchForTurn(this.value, turnIndex);
            dropdown.style.display = 'none';
        }
    });
    
    // 外側クリックで閉じる
    document.addEventListener('click', function(e) {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });
}
// ========================================
// IX. DISPLAY & INTEGRATION FUNCTIONS
// ========================================

/**
 * 複数ターン結果の表示
 */
function displayMultiTurnResults(totalHP, isSingleMove = false) {
    // ランク補正取得
    const atkRankElement = document.getElementById("attackerAtkRank");
    const defRankElement = document.getElementById("defenderDefRank");
    
    const atkRank = atkRankElement ? atkRankElement.value : "±0";
    const defRank = defRankElement ? defRankElement.value : "±0";
    
    // 最初の技のダメージ計算
    const attackerStats = calculateStats(attackerPokemon);
    const defenderStats = calculateStats(defenderPokemon);
    const isPhysical = currentMove.category === "Physical";
    const attackValue = isPhysical ? attackerStats.a : attackerStats.c;
    const defenseValue = isPhysical ? defenderStats.b : defenderStats.d;
    
    const damageRange = calculateDamage(
        attackValue,
        defenseValue,
        attackerPokemon.level,
        calculatePower(currentMove),
        currentMove.category,
        currentMove.type,
        attackerPokemon.types,
        defenderPokemon.types,
        atkRank,
        defRank
    );
    
    // 複数ターン表示として処理
    displayUnifiedResults(damageRange.min, damageRange.max, totalHP, true, atkRank, defRank);
}

/**
 * 単発ターン結果表示
 */
function displaySingleTurnResult(minDamage, maxDamage, totalHP) {
    displayUnifiedResults(minDamage, maxDamage, totalHP, false);
}

/**
 * 統合版結果表示
 */
function displayUnifiedResults(minDamage, maxDamage, totalHP, isMultiTurn, atkRank = "±0", defRank = "±0") {
    const resultDiv = document.getElementById("damageResult");
    if (!resultDiv) return;
    
    let html = "<div class=\"damage-calculation-result\">";
    
    // 基本ダメージ情報
    html += "<div class=\"damage-range\">";
    html += "<strong>ダメージ範囲:</strong> " + minDamage + " - " + maxDamage;
    html += "</div>";
    
    // 瀕死率計算
    const oneHitKORate = maxDamage >= totalHP ? 100 : 0;
    html += "<div class=\"ko-rate\">";
    html += "<strong>瀕死率:</strong> " + oneHitKORate + "%";
    html += "</div>";
    
    // ランク補正情報
    if (atkRank !== "±0" || defRank !== "±0") {
        html += "<div class=\"rank-info\">";
        html += "<small>ランク補正: 攻撃" + atkRank + " / 防御" + defRank + "</small>";
        html += "</div>";
    }
    
    // アイテム情報
    if (defenderPokemon.item) {
        html += "<div class=\"item-info\">";
        html += "<small>防御側アイテム: " + defenderPokemon.item.name + "</small>";
        html += "</div>";
    }
    
    html += "</div>";
    
    resultDiv.innerHTML = html;
}

/**
 * 統合版瀕死率表示HTML生成
 */
function generateUnifiedKORateHTML(koRates, actualTurns, moveInfo, evasionRankText = "", isMultiTurn = false) {
    if (!koRates || !koRates.basic) return "";
    
    const defenderItem = defenderPokemon.item;
    const hasItemEffect = defenderItem && (
        defenderItem.name === "たべのこし" || 
        defenderItem.name === "オボンのみ" ||
        defenderItem.name === "くろいヘドロ" ||
        isFigyBerry(defenderItem.name)
    );
    
    let html = "<div class=\"ko-rate-section\"><h4>瀕死率詳細</h4>";
    
    // 計算条件の説明
    html += "<div class=\"calculation-conditions\" style=\"text-align: center; margin-bottom: 10px; font-size: 11px; color: #666;\">";
    html += "急所率1/16を考慮";
    if (evasionRankText) {
        html += evasionRankText;
    }
    html += "</div>";
    
    // アイテム情報の表示
    if (hasItemEffect) {
        html += "<div class=\"item-info\" style=\"text-align: center; margin-bottom: 10px; font-size: 12px; color: #666;\">";
        html += "持ち物: " + defenderItem.name;
        html += "</div>";
    }
    
    // ターン数分だけ表示（単発の場合は1ターンのみ）
    const displayTurns = isMultiTurn ? actualTurns : 1;
    
    for (let turn = 0; turn < displayTurns; turn++) {
        const turnNumber = turn + 1;
        
        // 1ターン目は基本瀕死率、2ターン目以降はアイテム効果考慮
        let displayRate;
        if (turnNumber === 1) {
            displayRate = koRates.basic[turn];
        } else {
            if (hasItemEffect && koRates.withItems && koRates.withItems[turn] !== undefined) {
                displayRate = koRates.withItems[turn];
            } else {
                displayRate = koRates.basic[turn];
            }
        }
        
        html += "<div class=\"turn-result\">";
        html += "<strong>" + turnNumber + "ターン目:</strong> " + (displayRate * 100).toFixed(2) + "%";
        html += "</div>";
    }
    
    html += "</div>";
    return html;
}

// ========================================
// X. MISSING UI FUNCTIONS
// ========================================

/**
 * 詳細設定の表示切替
 */
function toggleDetail(side) {
    const detail = document.getElementById(`${side}Detail`);
    const header = detail.previousElementSibling;
    
    if (detail.style.display === 'none') {
        detail.style.display = 'block';
        header.textContent = '▼ 詳細設定を閉じる';
function swapPokemon() {
    // 一時的に攻撃側の情報を保存
    const tempPokemon = JSON.parse(JSON.stringify(attackerPokemon));
    
    // 入力欄の値を保存
    const tempInputs = {
        name: document.getElementById('attackerPokemon').value,
        level: document.getElementById('attackerLevel').value,
        nature: document.getElementById('attackerNature').value,
        item: document.getElementById('attackerItem').value,
        // 詳細設定の値も保存
        detailIvs: {},
        detailEvs: {},
        detailReals: {}
    };
    
    // 詳細設定の値を保存
    ['hp', 'a', 'b', 'c', 'd', 's'].forEach(stat => {
        const ivInput = document.getElementById(`attackerDetailIv${stat.toUpperCase()}`);
        const evInput = document.getElementById(`attackerDetailEv${stat.toUpperCase()}`);
        const realInput = document.getElementById(`attackerDetailReal${stat.toUpperCase()}`);
        if (ivInput) tempInputs.detailIvs[stat] = ivInput.value;
        if (evInput) tempInputs.detailEvs[stat] = evInput.value;
        if (realInput) tempInputs.detailReals[stat] = realInput.value;
    });
    
    // 防御側の値を攻撃側に設定
    attackerPokemon = JSON.parse(JSON.stringify(defenderPokemon));
    document.getElementById('attackerPokemon').value = document.getElementById('defenderPokemon').value;
    document.getElementById('attackerLevel').value = document.getElementById('defenderLevel').value;
    document.getElementById('attackerNature').value = document.getElementById('defenderNature').value;
    document.getElementById('attackerItem').value = document.getElementById('defenderItem').value;
    
    // 防御側に一時保存した値を設定
    defenderPokemon = tempPokemon;
    document.getElementById('defenderPokemon').value = tempInputs.name;
    document.getElementById('defenderLevel').value = tempInputs.level;
    document.getElementById('defenderNature').value = tempInputs.nature;
    document.getElementById('defenderItem').value = tempInputs.item;
    
    // ★修正：詳細設定の値を入れ替え
    swapDetailSettings(tempInputs);
    
    // ★修正：詳細設定から取得してレベル下の個体値・努力値を設定
    setMainStatsFromDetail();
    
    // ★修正：実数値の入れ替え
    swapRealStats(tempInputs);
    
    // ★修正：性格補正ボタンとチェックボックスの状態を正しく設定
    resetNatureUIAfterSwap();
    
    // ボタンの表示を更新
    updateAllButtons();
    
    // 特性の表示を更新
    updateAbilitiesAfterSwap();
    
    // ステータスを更新
    updateStats('attacker');
    updateStats('defender');
}

    } else {
function calculateTotalConstantDamage(maxHP, pokemonTypes, turn) {
    let totalDamage = 0;
    
    // 状態異常による定数ダメージ（起点ターン対応）
    const statusType = document.getElementById('statusDamageSelect').value;
    const statusStartTurn = parseInt(document.getElementById('statusDamageStartTurn')?.value) || 1;
    
    if (statusType !== 'none' && turn >= statusStartTurn) {
        totalDamage += calculateStatusDamage(maxHP, statusType, turn - statusStartTurn + 1);
    }
    
    // まきびしダメージ（1ターン目のみ）
    const spikesLevel = parseInt(document.getElementById('spikesLevel').value) || 0;
    totalDamage += calculateSpikesDamage(maxHP, spikesLevel, turn);
    
    // 天候による定数ダメージ
    const weather = document.getElementById('weatherSelect').value;
    totalDamage += calculateWeatherDamage(maxHP, pokemonTypes, weather);
    
    // のろいダメージ（起点ターン対応）
    const curseSelect = document.getElementById('curseSelect');
    if (curseSelect) {
        const curseStartTurn = parseInt(curseSelect.value);
        if (!isNaN(curseStartTurn) && turn >= curseStartTurn) {
            totalDamage += calculateCurseDamage(maxHP);
        }
    }
    
    // あくむダメージ（起点ターン対応）
    const nightmareSelect = document.getElementById('nightmareSelect');
    if (nightmareSelect) {
        const nightmareStartTurn = parseInt(nightmareSelect.value);
        if (!isNaN(nightmareStartTurn) && turn >= nightmareStartTurn) {
            totalDamage += calculateNightmareDamage(maxHP);
        }
    }
    
    // やどりぎダメージ（起点ターン対応）
    const leechSeedSelect = document.getElementById('leechSeedSelect');
    if (leechSeedSelect) {
        const leechSeedStartTurn = parseInt(leechSeedSelect.value);
        if (!isNaN(leechSeedStartTurn) && turn >= leechSeedStartTurn) {
            totalDamage += calculateLeechSeedDamage(maxHP);
        }
    }

    return totalDamage;
}

function handleAutoSettingChange() {
    
    // 現在の設定を確認
    const paralysisSelect = document.getElementById('paralysisSelect');
    const confusionSelect = document.getElementById('confusionSelect');
    const statusDamageSelect = document.getElementById('statusDamageSelect');
    const spikesLevelInput = document.getElementById('spikesLevel');
    const weatherSelect = document.getElementById('weatherSelect');
    
    // のろい・あくむ・やどりぎの設定取得
    const curseSelect = document.getElementById('curseSelect');
    const nightmareSelect = document.getElementById('nightmareSelect');
    const leechSeedSelect = document.getElementById('leechSeedSelect');
    const leechSeed2Select = document.getElementById('leechSeed2Select');
    
    const paralysisValue = paralysisSelect ? paralysisSelect.value : 'none';
    const confusionValue = confusionSelect ? confusionSelect.value : 'none';
    const statusDamageValue = statusDamageSelect ? statusDamageSelect.value : 'none';
    const spikesLevel = spikesLevelInput ? parseInt(spikesLevelInput.value) || 0 : 0;
    const weather = weatherSelect ? weatherSelect.value : 'none';
    
    // のろい・あくむ・やどりぎの値取得
    const curseValue = curseSelect ? curseSelect.value : 'none';
    const nightmareValue = nightmareSelect ? nightmareSelect.value : 'none';
    const leechSeedValue = leechSeedSelect ? leechSeedSelect.value : 'none';
    const leechSeed2Value = leechSeed2Select ? leechSeed2Select.value : 'none';

    const hasActionRestriction = (paralysisValue !== 'none' && paralysisValue !== '') || 
                               (confusionValue !== 'none' && confusionValue !== '');
    const hasConstantDamage = statusDamageValue !== 'none' || spikesLevel > 0 ||
                           (weather === 'sandstorm' || weather === 'hail') ||
                           (curseValue !== 'none' && curseValue !== '') ||
                           (nightmareValue !== 'none' && nightmareValue !== '') ||
                           (leechSeedValue !== 'none' && leechSeedValue !== '') ||
                           (leechSeed2Value !== 'none' && leechSeed2Value !== '');
   // 自動設定がすべてなくなり、かつユーザー入力の技もない場合は配列をクリア
   if (!hasActionRestriction && !hasConstantDamage && !hasUserInputMoves) {
       // 1ターン目以外をクリア
       for (let i = 1; i < 5; i++) {
           multiTurnMoves[i] = null;
       }
   }
}

function updateCastformTypeIfNeeded() {
    // 攻撃側がポワルンの場合
    if (attackerPokemon.name === 'ポワルン') {
        attackerPokemon.types = getCastformTypeByWeather();
        console.log('攻撃側ポワルンのタイプを更新:', attackerPokemon.types);
    }
    
    // 防御側がポワルンの場合
    if (defenderPokemon.name === 'ポワルン') {
        defenderPokemon.types = getCastformTypeByWeather();
        console.log('防御側ポワルンのタイプを更新:', defenderPokemon.types);
    }
}

console.log("🔥 performDamageCalculationEnhanced関数定義開始");

function performDamageCalculationEnhanced() {
    console.log("🎯 performDamageCalculationEnhanced関数開始");
    // ツール情報非表示
    try {
        document.querySelector('.tool-info').style.display = 'none';
        console.log("✅ ツール情報非表示完了");
    } catch (e) {
        console.log("⚠️ ツール情報非表示スキップ:", e.message);
    }
    // ポワルンのタイプを最新の天候に更新
    try {
        updateCastformTypeIfNeeded();
        console.log("✅ ポワルン更新完了");
    } catch (e) {
        console.error("❌ ポワルン更新エラー:", e.message);
    }

    // 入力チェック
    if (!attackerPokemon.name || !defenderPokemon.name) {
        console.log('ポケモンが選択されていません');
        alert('攻撃側と防御側のポケモンを選択してください');
        return;
    }

    if (!currentMove) {
        console.log('技が選択されていません');
        alert('技を選択してください');
        return;
    }
    
    handleAutoSettingChange();
    
    // 行動制限チェック（まひ・こんらん）
    const paralysisSelect = document.getElementById('paralysisSelect');
    const confusionSelect = document.getElementById('confusionSelect');
    const hasParalysis = paralysisSelect && paralysisSelect.value !== 'none';
    const hasConfusion = confusionSelect && confusionSelect.value !== 'none';
    const hasActionRestriction = hasParalysis || hasConfusion;

    // 複数ターン技が実際に設定されているかチェック
    const hasMultiTurn = hasMultiTurnMoves();
    
    // 定数ダメージの設定があるかチェック（やけど、どく、もうどく、まきびし、天候、のろい、あくむ、やどりぎ）
    const statusType = document.getElementById('statusDamageSelect').value;
    const spikesLevel = parseInt(document.getElementById('spikesLevel').value) || 0;
    const weather = document.getElementById('weatherSelect').value;
    const curseSelect = document.getElementById('curseSelect');
    const nightmareSelect = document.getElementById('nightmareSelect');
    const leechSeedSelect = document.getElementById('leechSeedSelect');
    
    const curseValue = curseSelect ? curseSelect.value : 'none';
    const nightmareValue = nightmareSelect ? nightmareSelect.value : 'none';
    const leechSeedValue = leechSeedSelect ? leechSeedSelect.value : 'none';
    
    const hasConstantDamage = statusType !== 'none' || spikesLevel > 0 || 
                            (weather === 'sandstorm' || weather === 'hail') ||
                            (curseValue !== 'none' && curseValue !== '') ||
                            (nightmareValue !== 'none' && nightmareValue !== '') ||
                            (leechSeedValue !== 'none' && leechSeedValue !== '');
    
    // 複数ターン表示が必要な条件：
    // 1. 実際に複数ターン技が設定されている
    // 2. 行動制限（まひ・こんらん）がある
    const needsMultiTurnDisplay = hasMultiTurn || hasActionRestriction;
    
    if (needsMultiTurnDisplay) {
        
        // 行動制限がある場合は、multiTurnMovesに技を事前設定
        if (hasActionRestriction) {
            const paralysisValue = hasParalysis ? parseInt(paralysisSelect.value) : 0;
            const confusionValue = hasConfusion ? parseInt(confusionSelect.value) : 0;
            const maxRestrictionTurn = Math.max(paralysisValue || 0, confusionValue || 0);
            const neededTurns = Math.max(maxRestrictionTurn, 2); // 最低2ターン
            
            // multiTurnMoves配列に技を設定
            multiTurnMoves[0] = currentMove; // 1ターン目
            for (let i = 1; i < neededTurns; i++) {
                if (!multiTurnMoves[i]) {
                    multiTurnMoves[i] = currentMove;
                    console.log(`${i + 1}ターン目に${currentMove.name}を設定（行動制限対応）`);
                }
            }
        }
        
        const defenderStats = calculateStats(defenderPokemon);
        displayMultiTurnResults(defenderStats.hp, false);
        return;
    }
    
    // 単発技だが定数ダメージがある場合
    // 内部的に複数ターン計算を使用するが、表示は単発として扱う
    if (hasConstantDamage) {
        
        // ★重要: 計算時のみ内部的に設定、表示判定には影響しない
        const tempMultiTurnMoves = [...multiTurnMoves]; // バックアップ
        multiTurnMoves[0] = currentMove;
        multiTurnMoves[1] = currentMove; // 定数ダメージ計算用に2ターン目も設定
        
        // ステータス計算とダメージ計算
        const attackerStats = calculateStats(attackerPokemon);
        const defenderStats = calculateStats(defenderPokemon);
        
        const isPhysical = currentMove.category === "Physical";
        const attackValue = isPhysical ? attackerStats.a : attackerStats.c;
        const defenseValue = isPhysical ? defenderStats.b : defenderStats.d;
        
        const atkRankElement = document.getElementById('attackerAtkRank');
        const defRankElement = document.getElementById('defenderDefRank');
        
        const atkRank = atkRankElement ? atkRankElement.value : '±0';
        const defRank = defRankElement ? defRankElement.value : '±0';
        
        const [minDamage, maxDamage] = calculateDamage(
            attackValue,
            defenseValue,
            attackerPokemon.level,
            currentMove.power || 0,
            currentMove.category,
            currentMove.type,
            attackerPokemon.types,
            defenderPokemon.types,
            atkRank,
            defRank
        );
        
        // 単発表示として結果を表示（内部的には複数ターン計算を使用）
        displayUnifiedResults(minDamage, maxDamage, defenderStats.hp, false, atkRank, defRank);
        
        // ★重要: 表示後、配列を適切な状態に戻す
        multiTurnMoves[1] = null; // 内部計算用の2ターン目をクリア
        
        return;
    }
    
    // 通常の単発技計算
    for (let i = 1; i < 5; i++) {
        multiTurnMoves[i] = null;
    }
    multiTurnMoves[0] = currentMove;
    
    // ステータス計算とダメージ計算
    const attackerStats = calculateStats(attackerPokemon);
    const defenderStats = calculateStats(defenderPokemon);
    
    const isPhysical = currentMove.category === "Physical";
    const attackValue = isPhysical ? attackerStats.a : attackerStats.c;
    const defenseValue = isPhysical ? defenderStats.b : defenderStats.d;
    
    const atkRankElement = document.getElementById('attackerAtkRank');
    const defRankElement = document.getElementById('defenderDefRank');
    
    const atkRank = atkRankElement ? atkRankElement.value : '±0';
    const defRank = defRankElement ? defRankElement.value : '±0';
    
    const [baseDamageMin, baseDamageMax] = calculateDamage(
        attackValue,
        defenseValue,
        attackerPokemon.level,
        currentMove.power || 0,
        currentMove.category,
        currentMove.type,
        attackerPokemon.types,
        defenderPokemon.types,
        atkRank,
        defRank
    );
    
    let minDamage = baseDamageMin;
    let maxDamage = baseDamageMax;
    
    // 統合版結果表示を呼び出し
    displayUnifiedResults(minDamage, maxDamage, defenderStats.hp, false, atkRank, defRank);
}

console.log("📝 performDamageCalculationEnhanced関数定義完了");

// グローバルスコープに明示的に関数を設定
window.performDamageCalculationEnhanced = performDamageCalculationEnhanced;
console.log("🌐 performDamageCalculationEnhanced関数をグローバルスコープに設定完了");

// ========================================
function initializePageWithRestore() {
    // 既存の初期化処理
    loadAllData().then(() => {
        setupEventListeners();
        initializeNatureDataWithDropdown();
        syncIVInputs();
        setupStepInputs();
        initializeNatureButtons();
        updateDamageCalculationButton();
        setupMultiTurnMoveListeners();
        setupRealStatInputListeners();
        updateDetailSummary('attacker');
        updateDetailSummary('defender');
        setupHPSyncListeners();
        initializeMobileControls();
        
        // ★重要：データ読み込み完了後に入力値を復元
        setTimeout(() => {
            restoreInputValuesOnLoad();
            restoreSpecialSettings();
            restoreCurrentHP();
        }, 100);
    });
    
    // UI初期化
    document.getElementById('twofoldContainer').style.display = 'none';
    document.getElementById('multiHitContainer').style.display = 'none';
    
    // ナビゲーションメニューの動作
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });

        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
            });
        });
    }
}

function setNatureModifier(side, stat, value, button) {
    const target = side === 'attacker' ? attackerPokemon : defenderPokemon;
    target.natureModifiers[stat] = value;
    
    // ボタンの選択状態を更新
    const buttons = document.querySelectorAll(`.nature-btn[data-side="${side}"][data-stat="${stat}"]`);
    buttons.forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
    
    // 詳細設定のチェックボックスも更新
    const plusCheckbox = document.getElementById(`${side}${stat.toUpperCase()}Plus`);
    const minusCheckbox = document.getElementById(`${side}${stat.toUpperCase()}Minus`);
    
    if (plusCheckbox && minusCheckbox) {
        if (value === 1.1) {
            plusCheckbox.checked = true;
            minusCheckbox.checked = false;
        } else if (value === 0.9) {
            plusCheckbox.checked = false;
            minusCheckbox.checked = true;
        } else {
            plusCheckbox.checked = false;
            minusCheckbox.checked = false;
        }
    }
    
    // 性格を更新
    updateNatureFromModifiers(side);
    updateStats(side);
}

function setEV(side, stat, value) {
    const target = side === 'attacker' ? attackerPokemon : defenderPokemon;
    const inputId = `${side}Ev${stat.toUpperCase()}`;
    const input = document.getElementById(inputId);
    
    if (!input) return;
    
    const currentValue = parseInt(input.value) || 0;
    const newValue = currentValue === 252 ? 0 : 252;
    
    target.evValues[stat] = newValue;
    input.value = newValue;
    
    // ボタン表示を更新
    updateEVButton(input);
    
    // 詳細設定の努力値入力欄も更新
    const detailInputId = `${side}DetailEv${stat.toUpperCase()}`;
    const detailInput = document.getElementById(detailInputId);
    if (detailInput) {
        detailInput.value = newValue;
        updateDetailEVButton(detailInput);
    }
    
    updateStats(side);
    
    // ★改良: 防御側HPの努力値変更時は即座に現在HPも同期
    if (side === 'defender' && stat === 'hp') {
        // より短い遅延で確実に同期
        setTimeout(() => {
            syncCurrentHPWithMaxHP();
        }, 30);
    }
}

function setIV(side, stat, value) {
    const target = side === 'attacker' ? attackerPokemon : defenderPokemon;
    const inputId = `${side}Iv${stat.toUpperCase()}`;
    const input = document.getElementById(inputId);
    
    if (!input) return;
    
    const currentValue = parseInt(input.value) || 31;
    const newValue = currentValue === 31 ? 30 : 31;
    
    target.ivValues[stat] = newValue;
    input.value = newValue;
    
    // 詳細設定の入力欄も更新
    const detailInputId = `${side}DetailIv${stat.toUpperCase()}`;
    const detailInput = document.getElementById(detailInputId);
    if (detailInput) {
        detailInput.value = newValue;
        updateDetailIVButton(detailInput);
    }
    
    // ボタン表示を更新
    const parent = input.parentElement;
    const button = parent.querySelector('.iv-quick-btn');
    if (button) {
        const nextValue = newValue === 31 ? 30 : 31;
        button.textContent = nextValue;
        button.setAttribute('onclick', `setIV('${side}', '${stat}', ${nextValue})`);
    }
    
    updateStats(side);
    
    // ★改良: 防御側HPの個体値変更時は即座に現在HPも同期
    if (side === 'defender' && stat === 'hp') {
        // より短い遅延で確実に同期
        setTimeout(() => {
            syncCurrentHPWithMaxHP();
        }, 30);
    }
}

// X. MISSING UI FUNCTIONS
// ========================================

/**
 * 詳細設定の表示切替
 */
function toggleDetail(side) {
    const detail = document.getElementById(`${side}Detail`);
    const header = detail.previousElementSibling;
    
    if (detail.style.display === 'none') {
        detail.style.display = 'block';
        header.textContent = '▼ 詳細設定を閉じる';
    } else {
        detail.style.display = 'none';
        header.textContent = '▶ 詳細設定を開く';
    }
}
console.log("✅ script.js実行完了 - performDamageCalculationEnhanced:", typeof performDamageCalculationEnhanced);
}
}
