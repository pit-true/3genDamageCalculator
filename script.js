// ========================
// 1. グローバル変数定義
// ========================

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

// ========================
// 2. 初期化関数
// ========================

document.addEventListener('DOMContentLoaded', function() {
    loadAllData();
    setupEventListeners();
    initializeNatureData();
    syncIVInputs();
    setupStepInputs();
    initializeNatureButtons();
    updateDamageCalculationButton();
    setupMultiTurnMoveListeners();
    setupRealStatInputListeners();
    document.getElementById('twofoldContainer').style.display = 'none';
    document.getElementById('multiHitContainer').style.display = 'none';
    updateDetailSummary('attacker');
    updateDetailSummary('defender');
    setupHPSyncListeners();
    // ナビゲーションメニューの動作
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });

        // メニューリンクをクリックしたら閉じる
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
            });
        });
    }
});

// データ読み込み
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
        initializeDropdowns();
        
    } catch (error) {
        console.error('データ読み込みエラー:', error);
    }
}

// 性格データの初期化
function initializeNatureData() {
    natureData = natureDataList;
    populateNatureList();
}

function initializeNatureButtons() {
    // 攻撃側の初期化
    updateMainNatureButtons('attacker', 'a', 1.0);
    updateMainNatureButtons('attacker', 'c', 1.0);
    
    // 防御側の初期化
    updateMainNatureButtons('defender', 'b', 1.0);
    updateMainNatureButtons('defender', 'd', 1.0);
}

// イベントリスナーの設定
function setupEventListeners() {
    // レベル変更時（修正：制限更新を追加）
    document.getElementById('attackerLevel').addEventListener('change', function() {
        attackerPokemon.level = parseInt(this.value) || 50;
        updateStats('attacker');
        // 制限更新は updateStats 内で実行される
    });
    
    document.getElementById('defenderLevel').addEventListener('change', function() {
        defenderPokemon.level = parseInt(this.value) || 50;
        updateStats('defender');
        // 制限更新は updateStats 内で実行される
    });
    
    // inputイベントも追加（スピンボタン対応）（修正：制限更新を追加）
    document.getElementById('attackerLevel').addEventListener('input', function() {
        attackerPokemon.level = parseInt(this.value) || 50;
        updateStats('attacker');
        // 制限更新は updateStats 内で実行される
    });
    
    document.getElementById('defenderLevel').addEventListener('input', function() {
        defenderPokemon.level = parseInt(this.value) || 50;
        updateStats('defender');
        // 制限更新は updateStats 内で実行される
    });
    
    // 性格変更時
    document.getElementById('attackerNature').addEventListener('change', () => selectNature('attacker'));
    document.getElementById('defenderNature').addEventListener('change', () => selectNature('defender'));
    
    // 個体値変更時（表示されている欄）- ボタン更新を追加
    document.getElementById('attackerIvA').addEventListener('change', function() { 
        syncDetailIV('attacker', 'a'); 
        updateStats('attacker'); 
        updateIVButton(this); 
    });
    document.getElementById('attackerIvC').addEventListener('change', function() { 
        syncDetailIV('attacker', 'c'); 
        updateStats('attacker'); 
        updateIVButton(this); 
    });
    document.getElementById('defenderIvHP').addEventListener('change', function() { 
        syncDetailIV('defender', 'hp'); 
        updateStats('defender'); 
        updateIVButton(this); 
    });
    document.getElementById('defenderIvB').addEventListener('change', function() { 
        syncDetailIV('defender', 'b'); 
        updateStats('defender'); 
        updateIVButton(this); 
    });
    document.getElementById('defenderIvD').addEventListener('change', function() { 
        syncDetailIV('defender', 'd'); 
        updateStats('defender'); 
        updateIVButton(this); 
    });
    
    // 努力値変更時（メイン表示）
    document.getElementById('attackerEvA').addEventListener('change', function() { 
        syncDetailEV('attacker', 'a'); 
        updateStats('attacker'); 
        updateEVButton(this); 
    });
    document.getElementById('attackerEvC').addEventListener('change', function() { 
        syncDetailEV('attacker', 'c'); 
        updateStats('attacker'); 
        updateEVButton(this); 
    });
    document.getElementById('defenderEvHP').addEventListener('change', function() { 
        syncDetailEV('defender', 'hp'); 
        updateStats('defender'); 
        updateEVButton(this); 
    });
    document.getElementById('defenderEvB').addEventListener('change', function() { 
        syncDetailEV('defender', 'b'); 
        updateStats('defender'); 
        updateEVButton(this); 
    });
    document.getElementById('defenderEvD').addEventListener('change', function() { 
        syncDetailEV('defender', 'd'); 
        updateStats('defender'); 
        updateEVButton(this); 
    });

    // 天候変更時
    document.getElementById('weatherSelect').addEventListener('change', function() {
    updateWeatherBallIfNeeded();
    updateCastformTypeIfNeeded();
    });

    // まひ・こんらん変更時
    const paralysisSelect = document.getElementById('paralysisSelect');
    const confusionSelect = document.getElementById('confusionSelect');
    
    if (paralysisSelect) {
        paralysisSelect.addEventListener('change', function() {
            console.log('まひ設定変更:', this.value);
            handleActionRestrictionChange();
        });
    }
    
    if (confusionSelect) {
        confusionSelect.addEventListener('change', function() {
            console.log('こんらん設定変更:', this.value);
            handleActionRestrictionChange();
        });
    }
    const statusDamageSelect = document.getElementById('statusDamageSelect');
    const spikesLevelInput = document.getElementById('spikesLevel');
    
    if (statusDamageSelect) {
        statusDamageSelect.addEventListener('change', function() {
            console.log('状態異常ダメージ設定変更:', this.value);
            handleAutoSettingChange();
        });
    }
    
    if (spikesLevelInput) {
        spikesLevelInput.addEventListener('change', function() {
            console.log('まきびしレベル変更:', this.value);
            handleAutoSettingChange();
        });
    }

    const curseSelect = document.getElementById('curseSelect');
    const nightmareSelect = document.getElementById('nightmareSelect');
    const leechSeedSelect = document.getElementById('leechSeedSelect');
    
    if (curseSelect) {
        curseSelect.addEventListener('change', function() {
            console.log('のろい設定変更:', this.value);
            handleAutoSettingChange();
        });
    }
    
    if (nightmareSelect) {
        nightmareSelect.addEventListener('change', function() {
            console.log('あくむ設定変更:', this.value);
            handleAutoSettingChange();
        });
    }
    
    if (leechSeedSelect) {
        leechSeedSelect.addEventListener('change', function() {
            console.log('やどりぎ設定変更:', this.value);
            handleAutoSettingChange();
        });
    }
}

function handleActionRestrictionChange() {
    console.log('=== 行動制限変更処理開始 ===');
    
    const paralysisSelect = document.getElementById('paralysisSelect');
    const confusionSelect = document.getElementById('confusionSelect');
    const paralysisValue = paralysisSelect ? paralysisSelect.value : 'none';
    const confusionValue = confusionSelect ? confusionSelect.value : 'none';
    
    const hasParalysis = paralysisValue !== 'none' && paralysisValue !== '';
    const hasConfusion = confusionValue !== 'none' && confusionValue !== '';
    const hasActionRestriction = hasParalysis || hasConfusion;
    
    console.log('行動制限設定:', {
        paralysis: paralysisValue,
        confusion: confusionValue,
        hasActionRestriction: hasActionRestriction
    });
    
    // ユーザーが入力した技があるかチェック
    let hasUserInputMoves = false;
    for (let i = 2; i <= 5; i++) {
        const input = document.getElementById(`multiTurnMove${i}`);
        if (input && input.value && input.value.trim() !== '') {
            hasUserInputMoves = true;
            break;
        }
    }
    
    console.log('ユーザー入力の複数ターン技:', hasUserInputMoves);
    
    // 行動制限がなくなり、かつユーザー入力の技もない場合は配列をクリア
    if (!hasActionRestriction && !hasUserInputMoves) {
        console.log('行動制限なし＆ユーザー入力技なし → multiTurnMoves配列をクリア');
        // 1ターン目以外をクリア
        for (let i = 1; i < 5; i++) {
            multiTurnMoves[i] = null;
        }
    }
    
    console.log('multiTurnMoves状態:', multiTurnMoves.map((move, i) => `${i}: ${move ? move.name : 'null'}`));
    console.log('=== 行動制限変更処理完了 ===');
}

// ユーザーが入力した複数ターン技があるかチェック
function hasUserInputMoves() {
    console.log('=== hasUserInputMoves チェック開始 ===');
    
    // 1. DOM入力欄の値をチェック（2-5ターン目）- 最優先
    let hasActualInputMoves = false;
    for (let i = 2; i <= 5; i++) {
        const input = document.getElementById(`multiTurnMove${i}`);
        if (input) {
            const value = input.value ? input.value.trim() : '';
            console.log(`${i}ターン目入力欄の値:`, `"${value}"`);
            if (value !== '') {
                console.log(`${i}ターン目に技が入力されています:`, value);
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
        const spikesLevel = parseInt(document.getElementById('spikesLevel').value) || 0;
        const weather = document.getElementById('weatherSelect').value;
        
        const paralysisValue = paralysisSelect ? paralysisSelect.value : 'none';
        const confusionValue = confusionSelect ? confusionSelect.value : 'none';
        const statusDamageValue = statusDamageSelect ? statusDamageSelect.value : 'none';
        
        const hasActionRestriction = (paralysisValue !== 'none' && paralysisValue !== '') || 
                                   (confusionValue !== 'none' && confusionValue !== '');
        const hasConstantDamage = statusDamageValue !== 'none' || spikesLevel > 0 || 
                                (weather === 'sandstorm' || weather === 'hail');
        
        console.log('自動設定条件チェック:', {
            hasActionRestriction: hasActionRestriction,
            hasConstantDamage: hasConstantDamage
        });
        
        // 自動設定が有効でない場合のみ配列をチェック
        if (!hasActionRestriction && !hasConstantDamage) {
            for (let i = 1; i < 5; i++) {
                if (multiTurnMoves[i] && multiTurnMoves[i].name && multiTurnMoves[i].name.trim() !== '') {
                    console.log(`multiTurnMoves[${i}]に技が設定されています:`, multiTurnMoves[i].name);
                    hasActualMultiTurnMoves = true;
                    break;
                }
            }
        } else {
            console.log('自動設定が有効のため、配列内の技は無視します');
        }
    }
    
    const result = hasActualMultiTurnMoves;
    
    console.log('=== hasUserInputMoves 結果 ===');
    console.log('入力欄での複数ターン技:', hasActualInputMoves);
    console.log('配列内での複数ターン技:', hasActualMultiTurnMoves);
    console.log('最終結果:', result);
    console.log('================================');
    
    return result;
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
    
    const paralysisValue = paralysisSelect ? paralysisSelect.value : 'none';
    const confusionValue = confusionSelect ? confusionSelect.value : 'none';
    const statusDamageValue = statusDamageSelect ? statusDamageSelect.value : 'none';
    const spikesLevel = spikesLevelInput ? parseInt(spikesLevelInput.value) || 0 : 0;
    const weather = weatherSelect ? weatherSelect.value : 'none';
    
    // のろい・あくむ・やどりぎの値取得
    const curseValue = curseSelect ? curseSelect.value : 'none';
    const nightmareValue = nightmareSelect ? nightmareSelect.value : 'none';
    const leechSeedValue = leechSeedSelect ? leechSeedSelect.value : 'none';
    
    const hasActionRestriction = (paralysisValue !== 'none' && paralysisValue !== '') || 
                               (confusionValue !== 'none' && confusionValue !== '');
    const hasConstantDamage = statusDamageValue !== 'none' || spikesLevel > 0 ||
                           (weather === 'sandstorm' || weather === 'hail') ||
                           (curseValue !== 'none' && curseValue !== '') ||
                           (nightmareValue !== 'none' && nightmareValue !== '') ||
                           (leechSeedValue !== 'none' && leechSeedValue !== '');
   
   // 自動設定がすべてなくなり、かつユーザー入力の技もない場合は配列をクリア
   if (!hasActionRestriction && !hasConstantDamage && !hasUserInputMoves) {
       // 1ターン目以外をクリア
       for (let i = 1; i < 5; i++) {
           multiTurnMoves[i] = null;
       }
   }
}

// 個体値入力の同期
function syncIVInputs() {
    // 攻撃側
    document.getElementById('attackerDetailIvA').value = document.getElementById('attackerIvA').value;
    document.getElementById('attackerDetailIvC').value = document.getElementById('attackerIvC').value;
    
    // 防御側
    document.getElementById('defenderDetailIvHP').value = document.getElementById('defenderIvHP').value;
    document.getElementById('defenderDetailIvB').value = document.getElementById('defenderIvB').value;
    document.getElementById('defenderDetailIvD').value = document.getElementById('defenderIvD').value;
    
    // 努力値も同期
    syncAllEVInputs();
    
    // ボタンの初期表示を更新
    updateAllButtons();
}

// 全努力値同期
function syncAllEVInputs() {
    // 攻撃側努力値同期
    ['hp', 'a', 'b', 'c', 'd', 's'].forEach(stat => {
        const mainId = `attackerEv${stat.toUpperCase()}`;
        const detailId = `attackerDetailEv${stat.toUpperCase()}`;
        const mainInput = document.getElementById(mainId);
        const detailInput = document.getElementById(detailId);
        
        if (mainInput && detailInput) {
            detailInput.value = mainInput.value || 0;
        }
    });
    
    // 防御側努力値同期
    ['hp', 'a', 'b', 'c', 'd', 's'].forEach(stat => {
        const mainId = `defenderEv${stat.toUpperCase()}`;
        const detailId = `defenderDetailEv${stat.toUpperCase()}`;
        const mainInput = document.getElementById(mainId);
        const detailInput = document.getElementById(detailId);
        
        if (mainInput && detailInput) {
            detailInput.value = mainInput.value || 0;
        }
    });
}

// 努力値の同期（メイン→詳細）
function syncDetailEV(side, stat) {
    const mainId = `${side}Ev${stat.toUpperCase()}`;
    const detailId = `${side}DetailEv${stat.toUpperCase()}`;
    const mainInput = document.getElementById(mainId);
    const detailInput = document.getElementById(detailId);
    
    if (mainInput && detailInput) {
        detailInput.value = mainInput.value;
        updateDetailEVButton(detailInput);
    }
}

// 努力値の同期（詳細→メイン）
function syncMainEV(side, stat) {
    const detailId = `${side}DetailEv${stat.toUpperCase()}`;
    const mainId = `${side}Ev${stat.toUpperCase()}`;
    const detailInput = document.getElementById(detailId);
    const mainInput = document.getElementById(mainId);
    
    if (detailInput && mainInput) {
        mainInput.value = detailInput.value;
        updateEVButton(mainInput);
    }
}

function syncDetailIV(side, stat) {
    const mainId = `${side}Iv${stat.toUpperCase()}`;
    const detailId = `${side}DetailIv${stat.toUpperCase()}`;
    const mainInput = document.getElementById(mainId);
    const detailInput = document.getElementById(detailId);
    
    if (mainInput && detailInput) {
        detailInput.value = mainInput.value;
        updateDetailIVButton(detailInput);
    }
}

// ========================
// 3. ドロップダウン機能
// ========================

function initializeDropdowns() {
    // ポケモン検索
    setupPokemonDropdown('attackerPokemon', 'attacker');
    setupPokemonDropdown('defenderPokemon', 'defender');
    
    // 技検索
    setupMoveDropdown();
    
    // アイテム検索
    setupItemDropdown('attackerItem', 'attacker');
    setupItemDropdown('defenderItem', 'defender');
}

// ポケモンドロップダウンの設定
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

// ポケモンリスト表示
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

// ポケモンフィルタリング
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

// 技ドロップダウンの設定
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

// 技の完全一致チェック
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

// 全ての技特殊設定を非表示にする
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

// アイテムドロップダウンの設定を修正
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

// アイテムの完全一致チェック
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

function checkExactMoveMatchForTurn(inputText, turn) {
    if (!inputText || inputText.trim() === '') {
        multiTurnMoves[turn] = null;
        //console.log(`${turn + 1}ターン目の技をクリア（空入力）`);
        return;
    }
    
    const exactMatch = moveData.find(move => {
        return move.name === inputText ||
               (move.hiragana && move.hiragana === inputText) ||
               (move.romaji && move.romaji.toLowerCase() === inputText.toLowerCase());
    });
    
    if (exactMatch) {
        selectMultiTurnMove(turn, exactMatch.name);
    } else {
        multiTurnMoves[turn] = null;
        console.log(`一致する技が見つからないため${turn + 1}ターン目をクリア`);
    }
}

// 技リスト表示
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

// 技フィルタリング
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

// アイテムリスト表示
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

// アイテムフィルタリング
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

// ドロップダウンアイテム作成
function createDropdownItem(text, onClick) {
    const item = document.createElement('div');
    item.className = 'dropdown-item';
    item.textContent = text;
    item.addEventListener('click', onClick);
    return item;
}

// ========================
// 4. 選択処理
// ========================

// ポケモン選択
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

// ポケモン情報を入れ替える関数
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
// 詳細設定の値を入れ替える関数
function swapDetailSettings(tempInputs) {
    // 攻撃側詳細設定に防御側の値を設定
    ['hp', 'a', 'b', 'c', 'd', 's'].forEach(stat => {
        const defenderIvInput = document.getElementById(`defenderDetailIv${stat.toUpperCase()}`);
        const defenderEvInput = document.getElementById(`defenderDetailEv${stat.toUpperCase()}`);
        const attackerIvInput = document.getElementById(`attackerDetailIv${stat.toUpperCase()}`);
        const attackerEvInput = document.getElementById(`attackerDetailEv${stat.toUpperCase()}`);
        
        if (defenderIvInput && attackerIvInput) {
            attackerIvInput.value = defenderIvInput.value;
        }
        if (defenderEvInput && attackerEvInput) {
            attackerEvInput.value = defenderEvInput.value;
        }
    });
    
    // 防御側詳細設定に攻撃側の値を設定
    ['hp', 'a', 'b', 'c', 'd', 's'].forEach(stat => {
        const defenderIvInput = document.getElementById(`defenderDetailIv${stat.toUpperCase()}`);
        const defenderEvInput = document.getElementById(`defenderDetailEv${stat.toUpperCase()}`);
        
        if (defenderIvInput && tempInputs.detailIvs[stat] !== undefined) {
            defenderIvInput.value = tempInputs.detailIvs[stat];
        }
        if (defenderEvInput && tempInputs.detailEvs[stat] !== undefined) {
            defenderEvInput.value = tempInputs.detailEvs[stat];
        }
    });
}
// 実数値の入れ替える関数
function swapRealStats(tempInputs) {
    // まず詳細設定の実数値を入れ替え
    // 攻撃側詳細設定に防御側の値を設定
    ['hp', 'a', 'b', 'c', 'd', 's'].forEach(stat => {
        const defenderDetailReal = document.getElementById(`defenderDetailReal${stat.toUpperCase()}`);
        const attackerDetailReal = document.getElementById(`attackerDetailReal${stat.toUpperCase()}`);
        
        if (defenderDetailReal && attackerDetailReal) {
            const tempValue = defenderDetailReal.value;
            if (attackerDetailReal.updateValueSilently) {
                attackerDetailReal.updateValueSilently(tempValue);
            } else {
                attackerDetailReal.value = tempValue;
            }
        }
    });
    
    // 防御側詳細設定に攻撃側の値を設定
    ['hp', 'a', 'b', 'c', 'd', 's'].forEach(stat => {
        const defenderDetailReal = document.getElementById(`defenderDetailReal${stat.toUpperCase()}`);
        
        if (defenderDetailReal && tempInputs.detailReals[stat]) {
            if (defenderDetailReal.updateValueSilently) {
                defenderDetailReal.updateValueSilently(tempInputs.detailReals[stat]);
            } else {
                defenderDetailReal.value = tempInputs.detailReals[stat];
            }
        }
    });
    
    // 入れ替え完了後、詳細設定の実数値をメイン表示に代入
    // 攻撃側：詳細設定のA,Cをメイン表示のA,Cに代入
    const attackerDetailRealA = document.getElementById('attackerDetailRealA');
    const attackerDetailRealC = document.getElementById('attackerDetailRealC');
    const attackerRealA = document.getElementById('attackerRealA');
    const attackerRealC = document.getElementById('attackerRealC');
    
    if (attackerDetailRealA && attackerRealA) {
        const valueA = attackerDetailRealA.value;
        if (attackerRealA.updateValueSilently) {
            attackerRealA.updateValueSilently(valueA);
        } else {
            attackerRealA.value = valueA;
        }
    }
    
    if (attackerDetailRealC && attackerRealC) {
        const valueC = attackerDetailRealC.value;
        if (attackerRealC.updateValueSilently) {
            attackerRealC.updateValueSilently(valueC);
        } else {
            attackerRealC.value = valueC;
        }
    }
    
    // 防御側：詳細設定のHP,B,Dをメイン表示のHP,B,Dに代入
    const defenderDetailRealHP = document.getElementById('defenderDetailRealHP');
    const defenderDetailRealB = document.getElementById('defenderDetailRealB');
    const defenderDetailRealD = document.getElementById('defenderDetailRealD');
    const defenderRealHP = document.getElementById('defenderRealHP');
    const defenderRealB = document.getElementById('defenderRealB');
    const defenderRealD = document.getElementById('defenderRealD');
    
    if (defenderDetailRealHP && defenderRealHP) {
        const valueHP = defenderDetailRealHP.value;
        if (defenderRealHP.updateValueSilently) {
            defenderRealHP.updateValueSilently(valueHP);
        } else {
            defenderRealHP.value = valueHP;
        }
    }
    
    if (defenderDetailRealB && defenderRealB) {
        const valueB = defenderDetailRealB.value;
        if (defenderRealB.updateValueSilently) {
            defenderRealB.updateValueSilently(valueB);
        } else {
            defenderRealB.value = valueB;
        }
    }
    
    if (defenderDetailRealD && defenderRealD) {
        const valueD = defenderDetailRealD.value;
        if (defenderRealD.updateValueSilently) {
            defenderRealD.updateValueSilently(valueD);
        } else {
            defenderRealD.value = valueD;
        }
    }
}

// 性格UI（ボタンとチェックボックス）をリセットして正しく設定する関数
function resetNatureUIAfterSwap() {
    // 攻撃側の性格補正を取得して設定
    const attackerNature = document.getElementById('attackerNature').value;
    const attackerNatureData = natureData.find(n => n.name === attackerNature);
    
    if (attackerNatureData) {
        // 攻撃側のnatureModifiersを更新
        attackerPokemon.natureModifiers = { a: 1.0, b: 1.0, c: 1.0, d: 1.0, s: 1.0 };
        Object.keys(attackerNatureData).forEach(stat => {
            if (stat !== 'name' && attackerPokemon.natureModifiers[stat] !== undefined) {
                attackerPokemon.natureModifiers[stat] = attackerNatureData[stat];
            }
        });
        
        // 攻撃側のメイン性格ボタンを更新
        updateMainNatureButtons('attacker', 'a', attackerPokemon.natureModifiers.a);
        updateMainNatureButtons('attacker', 'c', attackerPokemon.natureModifiers.c);
        
        // 攻撃側の詳細チェックボックスを更新
        updateDetailNatureCheckboxes('attacker', attackerPokemon.natureModifiers);
    }
    
    // 防御側の性格補正を取得して設定
    const defenderNature = document.getElementById('defenderNature').value;
    const defenderNatureData = natureData.find(n => n.name === defenderNature);
    
    if (defenderNatureData) {
        // 防御側のnatureModifiersを更新
        defenderPokemon.natureModifiers = { a: 1.0, b: 1.0, c: 1.0, d: 1.0, s: 1.0 };
        Object.keys(defenderNatureData).forEach(stat => {
            if (stat !== 'name' && defenderPokemon.natureModifiers[stat] !== undefined) {
                defenderPokemon.natureModifiers[stat] = defenderNatureData[stat];
            }
        });
        
        // 防御側のメイン性格ボタンを更新
        updateMainNatureButtons('defender', 'b', defenderPokemon.natureModifiers.b);
        updateMainNatureButtons('defender', 'd', defenderPokemon.natureModifiers.d);
        
        // 防御側の詳細チェックボックスを更新
        updateDetailNatureCheckboxes('defender', defenderPokemon.natureModifiers);
    }
}

// 詳細設定の性格チェックボックスを更新する関数
function updateDetailNatureCheckboxes(side, natureModifiers) {
    // すべてのチェックボックスをクリア
    const checkboxes = document.querySelectorAll(`.nature-plus-checkbox[data-side="${side}"], .nature-minus-checkbox[data-side="${side}"]`);
    checkboxes.forEach(cb => cb.checked = false);
    
    // 現在の性格補正に基づいてチェック
    ['a', 'b', 'c', 'd', 's'].forEach(stat => {
        if (natureModifiers[stat] === 1.1) {
            const plusCheckbox = document.getElementById(`${side}${stat.toUpperCase()}Plus`);
            if (plusCheckbox) plusCheckbox.checked = true;
        } else if (natureModifiers[stat] === 0.9) {
            const minusCheckbox = document.getElementById(`${side}${stat.toUpperCase()}Minus`);
            if (minusCheckbox) minusCheckbox.checked = true;
        }
    });
}

// 詳細設定からメインの個体値・努力値を設定する関数
function setMainStatsFromDetail() {
    // 攻撃側：詳細設定A,Cをメイン表示A,Cに設定
    const attackerDetailIvA = document.getElementById('attackerDetailIvA');
    const attackerDetailIvC = document.getElementById('attackerDetailIvC');
    const attackerDetailEvA = document.getElementById('attackerDetailEvA');
    const attackerDetailEvC = document.getElementById('attackerDetailEvC');
    
    const attackerIvA = document.getElementById('attackerIvA');
    const attackerIvC = document.getElementById('attackerIvC');
    const attackerEvA = document.getElementById('attackerEvA');
    const attackerEvC = document.getElementById('attackerEvC');
    
    if (attackerDetailIvA && attackerIvA) {
        attackerIvA.value = attackerDetailIvA.value;
        updateIVButton(attackerIvA);
    }
    if (attackerDetailIvC && attackerIvC) {
        attackerIvC.value = attackerDetailIvC.value;
        updateIVButton(attackerIvC);
    }
    if (attackerDetailEvA && attackerEvA) {
        attackerEvA.value = attackerDetailEvA.value;
        updateEVButton(attackerEvA);
    }
    if (attackerDetailEvC && attackerEvC) {
        attackerEvC.value = attackerDetailEvC.value;
        updateEVButton(attackerEvC);
    }
    
    // 防御側：詳細設定HP,B,Dをメイン表示HP,B,Dに設定
    const defenderDetailIvHP = document.getElementById('defenderDetailIvHP');
    const defenderDetailIvB = document.getElementById('defenderDetailIvB');
    const defenderDetailIvD = document.getElementById('defenderDetailIvD');
    const defenderDetailEvHP = document.getElementById('defenderDetailEvHP');
    const defenderDetailEvB = document.getElementById('defenderDetailEvB');
    const defenderDetailEvD = document.getElementById('defenderDetailEvD');
    
    const defenderIvHP = document.getElementById('defenderIvHP');
    const defenderIvB = document.getElementById('defenderIvB');
    const defenderIvD = document.getElementById('defenderIvD');
    const defenderEvHP = document.getElementById('defenderEvHP');
    const defenderEvB = document.getElementById('defenderEvB');
    const defenderEvD = document.getElementById('defenderEvD');
    
    if (defenderDetailIvHP && defenderIvHP) {
        defenderIvHP.value = defenderDetailIvHP.value;
        updateIVButton(defenderIvHP);
    }
    if (defenderDetailIvB && defenderIvB) {
        defenderIvB.value = defenderDetailIvB.value;
        updateIVButton(defenderIvB);
    }
    if (defenderDetailIvD && defenderIvD) {
        defenderIvD.value = defenderDetailIvD.value;
        updateIVButton(defenderIvD);
    }
    if (defenderDetailEvHP && defenderEvHP) {
        defenderEvHP.value = defenderDetailEvHP.value;
        updateEVButton(defenderEvHP);
    }
    if (defenderDetailEvB && defenderEvB) {
        defenderEvB.value = defenderDetailEvB.value;
        updateEVButton(defenderEvB);
    }
    if (defenderDetailEvD && defenderEvD) {
        defenderEvD.value = defenderDetailEvD.value;
        updateEVButton(defenderEvD);
    }
}

// 特性表示を更新する関数
function updateAbilitiesAfterSwap() {
    if (attackerPokemon.name) {
        const attackerInfo = allPokemonData.find(p => p.name === attackerPokemon.name);
        if (attackerInfo && attackerInfo.ability) {
            updateAbilityCheckboxes('attacker', attackerInfo.ability);
        } else {
            hideAllAbilityCheckboxes('attacker');
        }
    } else {
        hideAllAbilityCheckboxes('attacker');
    }
    
    if (defenderPokemon.name) {
        const defenderInfo = allPokemonData.find(p => p.name === defenderPokemon.name);
        if (defenderInfo && defenderInfo.ability) {
            updateDefenderAbilityCheckboxes(defenderInfo.ability);
        } else {
            hideAllDefenderAbilityCheckboxes();
        }
    } else {
        hideAllDefenderAbilityCheckboxes();
    }
}
// ウェザーボールのタイプと分類を取得する
function getWeatherBallTypeAndCategory() {
    const weather = document.getElementById('weatherSelect').value;
    switch (weather) {
        case 'sunny':
            return { type: 'ほのお', category: 'Special' };
        case 'rain':
            return { type: 'みず', category: 'Special' };
        case 'sandstorm':
            return { type: 'いわ', category: 'Physical' };
        case 'hail':
            return { type: 'こおり', category: 'Special' };
        default:
            return { type: 'ノーマル', category: 'Special' }; // 天候なしの場合
    }
}
// 天候変更時にウェザーボールを更新する
function updateWeatherBallIfNeeded() {
    // 現在選択されている技がウェザーボールの場合
    if (currentMove && currentMove.class === 'weather_ball') {
        const weatherData = getWeatherBallTypeAndCategory();
        currentMove.type = weatherData.type;
        currentMove.category = weatherData.category;
    }
    
    // 複数ターン技でウェザーボールがある場合
    for (let i = 0; i < multiTurnMoves.length; i++) {
        if (multiTurnMoves[i] && multiTurnMoves[i].class === 'weather_ball') {
            const weatherData = getWeatherBallTypeAndCategory();
            multiTurnMoves[i].type = weatherData.type;
            multiTurnMoves[i].category = weatherData.category;
        }
    }
}
// ポワルンの天候による形態変化を取得する
function getCastformTypeByWeather() {
    const weather = document.getElementById('weatherSelect').value;
    
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

// ポワルンのタイプを更新する
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

// 技選択
function selectMove(moveName) {
    
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
    
    currentMove = moveData.find(m => m.name === moveName);

    // 技のクラスに応じて表示
    switch (currentMove.class) {
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

// 連続技の表示情報を取得する関数
function getMultiHitDisplayInfo(minDamage, maxDamage, totalHP, currentMove) {
    if (!currentMove || currentMove.class !== 'multi_hit') {
        return {
            displayMinDamage: minDamage,
            displayMaxDamage: maxDamage,
            moveDisplayText: ''
        };
    }
    
    const hitCountSelect = document.getElementById('multiHitCount');
    const selectedHitCount = hitCountSelect ? hitCountSelect.value : '2-5';
    const constantDamage = calculateTotalConstantDamage(totalHP, defenderPokemon.types, 1);
    const movePower = calculatePower(currentMove);
    const accuracyText = currentMove.accuracy < 100 ? `, 命中${currentMove.accuracy}` : '';
    
    let displayMinDamage, displayMaxDamage, moveDisplayText;
    
    if (selectedHitCount === '2-5') {
        // 2-5回の場合
        displayMinDamage = minDamage * 2 + constantDamage;
        displayMaxDamage = maxDamage * 5 + constantDamage;
        moveDisplayText = `${currentMove.name} (威力${movePower}×2-5発, ${currentMove.type}, ${currentMove.category === 'Physical' ? '物理' : '特殊'}${accuracyText})`;
        console.log(`連続技表示: 2-5回, ダメージ範囲 ${displayMinDamage}~${displayMaxDamage}`);
    } else {
        // 固定回数の場合（2, 3, 4, 5）
        const hitCount = parseInt(selectedHitCount);
        displayMinDamage = minDamage * hitCount + constantDamage;
        displayMaxDamage = maxDamage * hitCount + constantDamage;
        moveDisplayText = `${currentMove.name} (威力${movePower}×${hitCount}発, ${currentMove.type}, ${currentMove.category === 'Physical' ? '物理' : '特殊'}${accuracyText})`;
        console.log(`連続技表示: ${hitCount}回, ダメージ範囲 ${displayMinDamage}~${displayMaxDamage}`);
    }
    
    return {
        displayMinDamage,
        displayMaxDamage,
        moveDisplayText
    };
}

// 2回攻撃技の乱数計算
function calculateTwoHitRandText(minDamage, maxDamage, targetHP, isSubstitute) {
    console.log(`2回攻撃技乱数計算開始: ${currentMove.name}`);
    console.log(`ダメージ ${minDamage}~${maxDamage}, 対象HP ${targetHP}`);
    
    // 2回攻撃技の総ダメージ（既に2倍されている前提）
    const totalMinDamage = minDamage;
    const totalMaxDamage = maxDamage;
    
    console.log(`2回攻撃技の総ダメージ: ${totalMinDamage}~${totalMaxDamage}`);
    
    // 定数ダメージを加算
    const constantDamage = calculateTotalConstantDamage(defenderPokemon.baseStats?.hp || targetHP, defenderPokemon.types, 1);
    const effectiveMinDamage = totalMinDamage + constantDamage;
    const effectiveMaxDamage = totalMaxDamage + constantDamage;
    
    console.log(`定数ダメージ込み: ${effectiveMinDamage}~${effectiveMaxDamage}`);
    
    // 確定1発判定
    if (effectiveMinDamage >= targetHP) {
        return {
            hits: 1,
            percent: null,
            randLevel: "確定",
            effectiveMinDamage: effectiveMinDamage,
            effectiveMaxDamage: effectiveMaxDamage,
            isSubstitute: isSubstitute,
            targetHP: targetHP,
            isTwoHit: true,
            hitCount: 2
        };
    }
    
    // 乱数1発判定
    if (effectiveMaxDamage >= targetHP) {
        // 成功する乱数パターンを計算
        const damageRange = effectiveMaxDamage - effectiveMinDamage + 1;
        const successfulRange = effectiveMaxDamage - Math.max(effectiveMinDamage, targetHP) + 1;
        const successRate = (successfulRange / damageRange) * 100;
        
        let randLevel = "";
        if (successRate >= 93.75) {
            randLevel = "超高乱数";
        } else if (successRate >= 75.0) {
            randLevel = "高乱数";
        } else if (successRate >= 62.5) {
            randLevel = "中高乱数";
        } else if (successRate >= 37.5) {
            randLevel = "中乱数";
        } else if (successRate >= 25.0) {
            randLevel = "中低乱数";
        } else if (successRate > 6.3) {
            randLevel = "低乱数";
        } else {
            randLevel = "超低乱数";
        }
        
        return {
            hits: 1,
            percent: successRate.toFixed(1),
            randLevel: randLevel,
            effectiveMinDamage: effectiveMinDamage,
            effectiveMaxDamage: effectiveMaxDamage,
            isSubstitute: isSubstitute,
            targetHP: targetHP,
            isTwoHit: true,
            hitCount: 2
        };
    }
    
    // 2発確定の場合
    const requiredHits = Math.ceil(targetHP / effectiveMinDamage);
    return {
        hits: requiredHits,
        percent: null,
        randLevel: "確定",
        effectiveMinDamage: effectiveMinDamage,
        effectiveMaxDamage: effectiveMaxDamage,
        isSubstitute: isSubstitute,
        targetHP: targetHP,
        isTwoHit: true,
        hitCount: 2
    };
}


// 複数ターン技の選択
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

// 特性チェックボックスの表示制御
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

// 防御側の特性更新関数
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

// アイテム選択
function selectItem(side, itemName) {
    const item = itemName ? itemData.find(i => i.name === itemName) : null;
    if (side === 'attacker') {
        attackerPokemon.item = item;
    } else {
        defenderPokemon.item = item;
    }
}

// 性格選択
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

// 性格リスト作成
function populateNatureList() {
    const list = document.getElementById('natureList');
    list.innerHTML = '';
    
    natureData.forEach(nature => {
        const option = document.createElement('option');
        option.value = nature.name;
        list.appendChild(option);
    });
}

// ========================
// 5. ステータス計算
// ========================

// 個体値設定
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

// 詳細設定の個体値設定
function setDetailIV(side, stat, value) {
    const target = side === 'attacker' ? attackerPokemon : defenderPokemon;
    const detailInputId = `${side}DetailIv${stat.toUpperCase()}`;
    const detailInput = document.getElementById(detailInputId);
    
    if (!detailInput) return;
    
    const currentValue = parseInt(detailInput.value) || 31;
    const newValue = currentValue === 31 ? 30 : 31;
    
    target.ivValues[stat] = newValue;
    detailInput.value = newValue;
    
    // メインの個体値入力欄も更新
    const mainInputId = `${side}Iv${stat.toUpperCase()}`;
    const mainInput = document.getElementById(mainInputId);
    if (mainInput) {
        mainInput.value = newValue;
        updateIVButton(mainInput);
    }
    
    // 詳細設定のボタンも更新
    updateDetailIVButton(detailInput);
    
    updateStats(side);
    
    // ★改良: 防御側HPの個体値変更時は即座に現在HPも同期
    if (side === 'defender' && stat === 'hp') {
        // より短い遅延で確実に同期
        setTimeout(() => {
            syncCurrentHPWithMaxHP();
        }, 30);
    }
}

// 詳細設定の努力値設定
function setDetailEV(side, stat, value) {
    const target = side === 'attacker' ? attackerPokemon : defenderPokemon;
    const detailInputId = `${side}DetailEv${stat.toUpperCase()}`;
    const detailInput = document.getElementById(detailInputId);
    
    if (!detailInput) return;
    
    const currentValue = parseInt(detailInput.value) || 0;
    const newValue = currentValue === 252 ? 0 : 252;
    
    target.evValues[stat] = newValue;
    detailInput.value = newValue;
    
    // メインの努力値入力欄も更新
    const mainInputId = `${side}Ev${stat.toUpperCase()}`;
    const mainInput = document.getElementById(mainInputId);
    if (mainInput) {
        mainInput.value = newValue;
        updateEVButton(mainInput);
    }
    
    // 詳細設定のボタンも更新
    updateDetailEVButton(detailInput);
    
    updateStats(side);
    
    // ★改良: 防御側HPの努力値変更時は即座に現在HPも同期
    if (side === 'defender' && stat === 'hp') {
        // より短い遅延で確実に同期
        setTimeout(() => {
            syncCurrentHPWithMaxHP();
        }, 30);
    }
}


// 努力値設定
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

// 個体値ボタンの表示を更新
function updateIVButton(input) {
    const value = parseInt(input.value) || 31;
    const buttonText = value === 31 ? '30' : '31';
    
    const parent = input.parentElement;
    const button = parent.querySelector('.iv-quick-btn');
    if (button) {
        button.textContent = buttonText;
        // onclick属性も更新
        const side = input.id.includes('attacker') ? 'attacker' : 'defender';
        const stat = input.id.match(/Iv([A-Z]+)/)[1].toLowerCase();
        button.setAttribute('onclick', `setIV('${side}', '${stat}', ${value === 31 ? 30 : 31})`);
    }
}

// 努力値ボタンの表示を更新
function updateEVButton(input) {
    const value = parseInt(input.value) || 0;
    const buttonText = value === 252 ? '0' : '252';
    
    const parent = input.parentElement;
    const button = parent.querySelector('.ev-quick-btn');
    if (button) {
        button.textContent = buttonText;
        // onclick属性も更新
        const side = input.id.includes('attacker') ? 'attacker' : 'defender';
        const stat = input.id.match(/Ev([A-Z]+)/)[1].toLowerCase();
        button.setAttribute('onclick', `setEV('${side}', '${stat}', ${value === 252 ? 0 : 252})`);
    }
}

function updateDetailEVButton(input) {
    const value = parseInt(input.value) || 0;
    const buttonText = value === 252 ? '0' : '252';
    
    const parent = input.parentElement;
    const button = parent.querySelector('.ev-quick-btn');
    if (button) {
        button.textContent = buttonText;
        // onclick属性も更新
        const side = input.id.includes('attacker') ? 'attacker' : 'defender';
        const stat = input.id.match(/Ev([A-Z]+)/)[1].toLowerCase();
        button.setAttribute('onclick', `setDetailEV('${side}', '${stat}', ${value === 252 ? 0 : 252})`);
    }
}

function updateDetailIVButton(input) {
    const value = parseInt(input.value) || 31;
    const buttonText = value === 31 ? '30' : '31';
    
    const parent = input.parentElement;
    const button = parent.querySelector('.iv-quick-btn');
    if (button) {
        button.textContent = buttonText;
        // onclick属性も更新
        const side = input.id.includes('attacker') ? 'attacker' : 'defender';
        const stat = input.id.match(/Iv([A-Z]+)/)[1].toLowerCase();
        button.setAttribute('onclick', `setDetailIV('${side}', '${stat}', ${value === 31 ? 30 : 31})`);
    }
}

// 4. 現在HPの強制同期関数
function syncCurrentHPWithMaxHP() {
    const maxHPInput = document.getElementById('defenderRealHP');
    const detailMaxHPInput = document.getElementById('defenderDetailRealHP');
    const currentHPInput = document.getElementById('defenderCurrentHP');
    
    if (!currentHPInput) return;
    
    // 最大HPを取得（メイン画面を優先）
    let maxHP = 0;
    if (maxHPInput && maxHPInput.value) {
        maxHP = parseInt(maxHPInput.value) || 0;
    } else if (detailMaxHPInput && detailMaxHPInput.value) {
        maxHP = parseInt(detailMaxHPInput.value) || 0;
    }
    
    if (maxHP > 0) {
        console.log(`現在HPを最大HP(${maxHP})に強制同期`);
        currentHPInput.value = maxHP;
        currentHPInput.setAttribute('data-max-hp', maxHP);
        currentHPInput.setAttribute('max', maxHP);
        currentHPInput.setAttribute('min', 1);
    }
}

// 5. HP関連の変更監視とリアルタイム同期
function setupHPSyncListeners() {
    // 防御側HP個体値・努力値・実数値の変更を監視
    const hpRelatedInputs = [
        'defenderIvHP',
        'defenderEvHP', 
        'defenderDetailIvHP',
        'defenderDetailEvHP',
        'defenderRealHP',
        'defenderDetailRealHP',
        'defenderLevel'
    ];
    
    hpRelatedInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            // input, change, blur イベントで監視
            ['input', 'change', 'blur'].forEach(eventType => {
                input.addEventListener(eventType, function() {
                    console.log(`HP関連変更検知: ${inputId} = ${this.value}`);
                    // 少し遅延させて確実に計算後に同期
                    setTimeout(() => {
                        syncCurrentHPWithMaxHP();
                    }, 50);
                });
            });
        }
    });
    
    // 防御側の性格変更も監視（HP実数値に影響する場合がある）
    const defenderNature = document.getElementById('defenderNature');
    if (defenderNature) {
        defenderNature.addEventListener('change', function() {
            setTimeout(() => {
                syncCurrentHPWithMaxHP();
            }, 100);
        });
    }
    
    // 防御側ポケモン変更も監視
    const defenderPokemon = document.getElementById('defenderPokemon');
    if (defenderPokemon) {
        defenderPokemon.addEventListener('change', function() {
            setTimeout(() => {
                syncCurrentHPWithMaxHP();
            }, 200); // ポケモン変更は少し長めの遅延
        });
    }
}

// 6. 現在HPの強制同期関数（改良版）
function syncCurrentHPWithMaxHP() {
    const maxHPInput = document.getElementById('defenderRealHP');
    const detailMaxHPInput = document.getElementById('defenderDetailRealHP');
    const currentHPInput = document.getElementById('defenderCurrentHP');
    
    // 最大HPを取得（メイン画面を優先、次に詳細画面、最後に計算値）
    let maxHP = 0;
    
    if (maxHPInput && maxHPInput.value && !isNaN(parseInt(maxHPInput.value))) {
        maxHP = parseInt(maxHPInput.value);
    } else if (detailMaxHPInput && detailMaxHPInput.value && !isNaN(parseInt(detailMaxHPInput.value))) {
        maxHP = parseInt(detailMaxHPInput.value);
    } else {
        // 実数値入力欄に値がない場合は計算で求める
        const stats = calculateStats(defenderPokemon);
        maxHP = stats.hp;
    }
    
    if (maxHP > 0) {
        const currentValue = parseInt(currentHPInput.value) || 0;
        const previousMaxHP = parseInt(currentHPInput.getAttribute('data-max-hp')) || 0;
        
        // 以下の条件で現在HPを同期
        // 1. 最大HPが変更された
        // 2. 現在HPが0
        // 3. 現在HPが新しい最大HPを超えている
        // 4. 現在HPが前の最大HPと同じ（満タン状態を維持）
        const shouldSync = 
            maxHP !== previousMaxHP || 
            currentValue === 0 || 
            currentValue > maxHP ||
            (previousMaxHP > 0 && currentValue === previousMaxHP);
        
        if (shouldSync) {
            currentHPInput.value = maxHP;
        }
        
        // 制限と記録を更新
        currentHPInput.setAttribute('data-max-hp', maxHP);
        currentHPInput.setAttribute('max', maxHP);
        currentHPInput.setAttribute('min', 1);
        
        // ポケモン名も記録
        const currentPokemonName = defenderPokemon.name || '';
        currentHPInput.setAttribute('data-pokemon-name', currentPokemonName);
    }
}
function setupStepInputs() {
    // 全ての努力値入力欄に4単位ステップとイベントリスナーを設定
    const evInputs = document.querySelectorAll('.ev-input');
    evInputs.forEach(input => {
        input.step = 4;
        input.addEventListener('input', handleEVInput);
        
        // 詳細設定の努力値入力欄の場合、change イベントも追加
        if (input.id.includes('Detail')) {
            input.addEventListener('change', function() {
                const side = this.id.includes('attacker') ? 'attacker' : 'defender';
                const stat = this.id.match(/Ev([A-Z]+)/)[1].toLowerCase();
                syncMainEV(side, stat);
                updateStats(side);
            });
        }
    });
    
    // 詳細設定の個体値入力欄にもイベントリスナーを追加
    const detailIvInputs = document.querySelectorAll('.detail-stat-row .iv-input');
    detailIvInputs.forEach(input => {
        input.addEventListener('change', function() {
            updateDetailIVButton(this);
            // メインの入力欄も同期
            const side = this.id.includes('attacker') ? 'attacker' : 'defender';
            const stat = this.id.match(/Iv([A-Z]+)/)[1].toLowerCase();
            syncMainIV(side, stat);
            updateStats(side);
            
            // めざめるパワーのタイプと分類が変わる可能性があるので更新
            if (side === 'attacker') {
                updateHiddenPowerIfNeeded();
            }
            // 防御側のめざパ表示も更新
            updateDetailSummary(side);
        });
    });

}

function syncMainIV(side, stat) {
    const detailInputId = `${side}DetailIv${stat.toUpperCase()}`;
    const mainInputId = `${side}Iv${stat.toUpperCase()}`;
    const detailInput = document.getElementById(detailInputId);
    const mainInput = document.getElementById(mainInputId);
    
    if (detailInput && mainInput) {
        mainInput.value = detailInput.value;
        updateIVButton(mainInput);
    }
}

function handleEVInput(event) {
    const input = event.target;
    let value = parseInt(input.value) || 0;
    
    // 4の倍数に調整
    value = Math.round(value / 4) * 4;
    
    // 範囲制限
    value = Math.max(0, Math.min(252, value));
    
    input.value = value;
    
    // ボタンの表示を更新
    if (input.closest('.detail-stat-row')) {
        updateDetailEVButton(input);
    } else {
        updateEVButton(input);
    }
    
    // 同期処理
    const side = input.id.includes('attacker') ? 'attacker' : 'defender';
    const stat = input.id.match(/Ev([A-Z]+)/)[1].toLowerCase();
    
    // 詳細設定の入力欄の場合はメインと同期
    if (input.closest('.detail-stat-row')) {
        syncMainEV(side, stat);
    } else {
        // メインの入力欄の場合は詳細設定と同期
        syncDetailEV(side, stat);
    }
    
    // ステータス更新
    updateStats(side);
}

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

// 性格補正ボタン
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

// 詳細設定の表示切替
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

// 性格チェックボックス処理
function handleNatureCheckbox(side, stat, type) {
    const target = side === 'attacker' ? attackerPokemon : defenderPokemon;
    
    // チェックボックスの状態を取得
    const checkboxId = `${side}${stat.toUpperCase()}${type === 'plus' ? 'Plus' : 'Minus'}`;
    const checkbox = document.getElementById(checkboxId);
    const isChecked = checkbox.checked;
    
    if (isChecked) {
        // 同じタイプの他のチェックボックスをオフにする
        const checkboxes = document.querySelectorAll(`.nature-${type}-checkbox[data-side="${side}"]`);
        checkboxes.forEach(cb => {
            if (cb !== checkbox) cb.checked = false;
        });
        
        // 性格補正を適用
        if (type === 'plus') {
            // 他のステータスの+補正を解除
            ['a', 'b', 'c', 'd', 's'].forEach(s => {
                if (s !== stat && target.natureModifiers[s] === 1.1) {
                    target.natureModifiers[s] = 1.0;
                }
            });
            target.natureModifiers[stat] = 1.1;
        } else {
            // 他のステータスの-補正を解除
            ['a', 'b', 'c', 'd', 's'].forEach(s => {
                if (s !== stat && target.natureModifiers[s] === 0.9) {
                    target.natureModifiers[s] = 1.0;
                }
            });
            target.natureModifiers[stat] = 0.9;
        }
    } else {
        // チェックを外した場合は補正を解除
        target.natureModifiers[stat] = 1.0;
    }
    
    // メイン画面の性格補正ボタンも更新
    updateMainNatureButtons(side, stat, target.natureModifiers[stat]);
    
    // 性格を更新
    updateNatureFromModifiers(side);
    updateStats(side);
}

// 性格補正から性格を逆算
function updateNatureFromModifiers(side) {
    const target = side === 'attacker' ? attackerPokemon : defenderPokemon;
    const inputId = side === 'attacker' ? 'attackerNature' : 'defenderNature';
    
    // 補正値から性格を特定
    const nature = natureData.find(n => {
        return ['a', 'b', 'c', 'd', 's'].every(stat => {
            const modifier = n[stat] || 1.0;
            return modifier === target.natureModifiers[stat];
        });
    });
    
    if (nature) {
        document.getElementById(inputId).value = nature.name;
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

// 性格チェックボックスの更新
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

// ステータス更新
function updateStats(side) {
    const target = side === 'attacker' ? attackerPokemon : defenderPokemon;
    const level = parseInt(document.getElementById(`${side}Level`).value) || 50;
    target.level = level;
    
    // 個体値を取得（メイン表示または詳細設定から）
    ['hp', 'a', 'b', 'c', 'd', 's'].forEach(stat => {
        const ivInput = document.getElementById(`${side}Iv${stat.toUpperCase()}`);
        const detailIvInput = document.getElementById(`${side}DetailIv${stat.toUpperCase()}`);
        
        let ivValue = target.ivValues[stat]; // デフォルトは現在の値
        
        if (ivInput && ivInput.value !== '') {
            const inputValue = parseInt(ivInput.value);
            if (!isNaN(inputValue) && inputValue >= 0 && inputValue <= 31) {
                ivValue = inputValue;
            }
        } else if (detailIvInput && detailIvInput.value !== '') {
            const inputValue = parseInt(detailIvInput.value);
            if (!isNaN(inputValue) && inputValue >= 0 && inputValue <= 31) {
                ivValue = inputValue;
            }
        }
        
        target.ivValues[stat] = ivValue;
    });
    
    // 努力値を取得（メイン表示または詳細設定から）
    ['hp', 'a', 'b', 'c', 'd', 's'].forEach(stat => {
        const evInput = document.getElementById(`${side}Ev${stat.toUpperCase()}`);
        const detailEvInput = document.getElementById(`${side}DetailEv${stat.toUpperCase()}`);
        
        let evValue = target.evValues[stat]; // デフォルトは現在の値
        
        if (evInput && evInput.value !== '') {
            const inputValue = parseInt(evInput.value);
            if (!isNaN(inputValue) && inputValue >= 0 && inputValue <= 252) {
                evValue = Math.floor(inputValue / 4) * 4; // 4の倍数に調整
            }
        } else if (detailEvInput && detailEvInput.value !== '') {
            const inputValue = parseInt(detailEvInput.value);
            if (!isNaN(inputValue) && inputValue >= 0 && inputValue <= 252) {
                evValue = Math.floor(inputValue / 4) * 4; // 4の倍数に調整
            }
        }
        
        target.evValues[stat] = evValue;
    });
    
    // 実数値計算
    const stats = calculateStats(target);
    
    // ★修正: 防御側のHP実数値が変更された場合の現在HP同期処理を強化
    if (side === 'defender') {
        setTimeout(() => {
            const maxHPInput = document.getElementById('defenderRealHP');
            const currentHPInput = document.getElementById('defenderCurrentHP');
            const detailMaxHPInput = document.getElementById('defenderDetailRealHP');

            if (maxHPInput && currentHPInput) {
                // メイン画面とdetail画面の両方からHP実数値を取得
                let newMaxHP = stats.hp;
                
                // メイン画面の実数値入力欄から値を取得（優先）
                if (maxHPInput.value && !isNaN(parseInt(maxHPInput.value))) {
                    newMaxHP = parseInt(maxHPInput.value);
                } else if (detailMaxHPInput && detailMaxHPInput.value && !isNaN(parseInt(detailMaxHPInput.value))) {
                    newMaxHP = parseInt(detailMaxHPInput.value);
                }
                
                // 前回の最大HPを取得
                const previousMaxHP = parseInt(currentHPInput.getAttribute('data-max-hp')) || 0;
                const currentValue = parseInt(currentHPInput.value) || 0;
                
                // ★重要: HP実数値が変更された場合は必ず現在HPを同期
                if (newMaxHP !== previousMaxHP || currentValue === 0 || currentValue > newMaxHP) {
                    currentHPInput.value = newMaxHP;
                }
                
                // 新しい最大HPを記録し、制限を設定
                currentHPInput.setAttribute('data-max-hp', newMaxHP);
                currentHPInput.setAttribute('max', newMaxHP);
                currentHPInput.setAttribute('min', 1);
                
                // ポケモン名も記録（ポケモン変更検知用）
                const currentPokemonName = defenderPokemon.name;
                currentHPInput.setAttribute('data-pokemon-name', currentPokemonName);
            }
        }, 50);
    }

    // 表示更新
    displayStats(side, stats);

    // めざめるパワーのタイプが変わる可能性があるので更新
    updateHiddenPowerIfNeeded();

    // 入力制限を更新
    if (target.name) { // ポケモンが選択されている場合のみ
        updateAllRealStatInputLimits(side);
    }

    // HP実数値が変更された場合、pinch系の技のHP値も更新
    if (side === 'attacker' && (currentMove?.class === 'pinch_up' || currentMove?.class === 'pinch_down')) {
        updatePinchHPValues();
    }
    
    // めざパと合計努力値の表示を更新
    updateDetailSummary(side);
}

// めざパと合計努力値の表示を更新
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


// 防御側専用のめざめるパワータイプ計算
function calculateDefenderHiddenPowerType() {
    // 防御側ポケモンの個体値を取得
    const ivs = {
        hp: parseInt(document.getElementById('defenderDetailIvHP').value),
        a: parseInt(document.getElementById('defenderDetailIvA').value),
        b: parseInt(document.getElementById('defenderDetailIvB').value),
        c: parseInt(document.getElementById('defenderDetailIvC').value),
        d: parseInt(document.getElementById('defenderDetailIvD').value),
        s: parseInt(document.getElementById('defenderDetailIvS').value)
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

// 防御側専用のめざめるパワー威力計算
function calculateDefenderHiddenPowerBP() {
    // 防御側ポケモンの個体値を取得
    const ivs = {
        hp: parseInt(document.getElementById('defenderDetailIvHP').value),
        a: parseInt(document.getElementById('defenderDetailIvA').value),
        b: parseInt(document.getElementById('defenderDetailIvB').value),
        c: parseInt(document.getElementById('defenderDetailIvC').value),
        d: parseInt(document.getElementById('defenderDetailIvD').value),
        s: parseInt(document.getElementById('defenderDetailIvS').value)
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

// 実数値計算
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

// ステータス表示
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

// ========================
// スピンボタン関係のリファクタリング
// ========================

/**
 * 実数値入力管理クラス
 * スピンボタンの動作と実数値の変更を統一的に管理
 */
class RealStatInputManager {
    constructor() {
        this.inputElements = new Map(); // 入力要素とその設定を管理
        this.isUpdating = new Set(); // 更新中フラグ
    }

    /**
     * 実数値入力要素を初期化
     */
    initializeRealStatInputs() {
        const config = [
            // メイン画面の実数値入力
            { id: 'attackerRealA', side: 'attacker', stat: 'a', type: 'main' },
            { id: 'attackerRealC', side: 'attacker', stat: 'c', type: 'main' },
            { id: 'defenderRealHP', side: 'defender', stat: 'hp', type: 'main' },
            { id: 'defenderRealB', side: 'defender', stat: 'b', type: 'main' },
            { id: 'defenderRealD', side: 'defender', stat: 'd', type: 'main' },
            
            // 詳細設定の実数値入力
            ...['hp', 'a', 'b', 'c', 'd', 's'].flatMap(stat => [
                { id: `attackerDetailReal${stat.toUpperCase()}`, side: 'attacker', stat, type: 'detail' },
                { id: `defenderDetailReal${stat.toUpperCase()}`, side: 'defender', stat, type: 'detail' }
            ])
        ];

        config.forEach(item => this.setupRealStatInput(item));
    }

    /**
     * 個別の実数値入力要素を設定
     */
    setupRealStatInput({ id, side, stat, type }) {
        const input = document.getElementById(id);
        if (!input) return;

        // 既存の要素を置換してイベントリスナーをクリア
        const newInput = this.createInputElement(input, { id, side, stat, type });
        input.parentNode.replaceChild(newInput, input);
        
        this.inputElements.set(id, { side, stat, type, element: newInput });
    }

    /**
     * 新しい入力要素を作成
     */
    createInputElement(originalInput, config) {
        const newInput = originalInput.cloneNode(true);
        newInput.removeAttribute('readonly');
        
        let previousValue = parseInt(newInput.value) || 0;
        const updateKey = config.id;

        // サイレント更新関数
        newInput.updateValueSilently = (newValue) => {
            this.isUpdating.add(updateKey);
            newInput.value = newValue;
            previousValue = parseInt(newValue) || 0;
            this.isUpdating.delete(updateKey);
        };

        // input イベント（スピンボタン操作時）
        newInput.addEventListener('input', (e) => {
            if (this.isUpdating.has(updateKey)) return;
            
            const currentValue = parseInt(e.target.value) || 0;
            const direction = this.getChangeDirection(currentValue, previousValue);
            
            if (direction !== 0) {
                this.isUpdating.add(updateKey);
                this.handleRealStatChange(config, currentValue, direction);
                this.isUpdating.delete(updateKey);
                previousValue = currentValue;
            }
        });

        // change イベント（直接入力時）
        newInput.addEventListener('change', (e) => {
            if (this.isUpdating.has(updateKey)) return;
            
            const currentValue = parseInt(e.target.value) || 0;
            if (currentValue !== previousValue) {
                this.isUpdating.add(updateKey);
                this.handleRealStatChange(config, currentValue, 0);
                this.isUpdating.delete(updateKey);
                previousValue = currentValue;
            }
        });

        // スピンボタンの特殊処理
        this.setupSpinButtonHandling(newInput, config);

        return newInput;
    }

    /**
     * 変化方向を判定
     */
    getChangeDirection(current, previous) {
        if (current > previous) return 1;
        if (current < previous) return -1;
        return 0;
    }

    /**
     * スピンボタンの特殊処理を設定
     */
    setupSpinButtonHandling(input, config) {
        // キーボード操作（矢印キー）
        input.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') {
                setTimeout(() => this.handleSpinButtonDown(config), 10);
            }
        });

        // マウス操作（スピンボタンクリック）
        input.addEventListener('mousedown', (e) => {
            if (this.isSpinButtonDownClick(e, input)) {
                setTimeout(() => this.handleSpinButtonDown(config), 10);
            }
        });
    }

    /**
     * スピンボタン下向きクリックかどうか判定
     */
    isSpinButtonDownClick(event, input) {
        const rect = input.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
        
        const isInSpinButtonArea = clickX > rect.width - 20;
        const isLowerHalf = clickY > rect.height / 2;
        
        return isInSpinButtonArea && isLowerHalf;
    }

    /**
     * スピンボタン下向き操作の処理
     */
    handleSpinButtonDown(config) {
        const pokemon = config.side === 'attacker' ? attackerPokemon : defenderPokemon;
        const currentRealStat = this.calculateCurrentStat(pokemon, config.stat);
        const limits = calculateStatLimits(pokemon.baseStats[config.stat], pokemon.level, config.stat === 'hp');
        
        // 個体値1→0の特殊処理
        if (currentRealStat === limits.min && pokemon.ivValues[config.stat] === 1) {
            const statWith0IV = calculateStatWithParams(
                pokemon.baseStats[config.stat], 
                pokemon.level, 
                0, 
                pokemon.evValues[config.stat], 
                pokemon.natureModifiers[config.stat], 
                config.stat === 'hp'
            );
            
            if (statWith0IV <= currentRealStat) {
                pokemon.ivValues[config.stat] = 0;
                updateIVEVInputs(config.side, config.stat, 0, pokemon.evValues[config.stat]);
                updateStats(config.side);
                return true;
            }
        }
        
        return false;
    }

    /**
     * 実数値変更の統一処理
     */
    handleRealStatChange(config, targetValue, direction) {
        const pokemon = config.side === 'attacker' ? attackerPokemon : defenderPokemon;
        const currentRealStat = this.calculateCurrentStat(pokemon, config.stat);
        
        // 基本的な制限チェック
        if (targetValue === currentRealStat) return;
        
        // 個体値1→0の特別処理
        if (this.handleSpecialIV1to0Case(pokemon, config, targetValue, direction)) {
            return;
        }
        
        // 個体値優先の最適化処理
        const result = this.findOptimalStatsIVFirst(pokemon, config.stat, targetValue, direction);
        if (result) {
            this.applyStatResult(pokemon, config, result);
        }

        // HP実数値が変更された場合は現在HPも更新
        if (config.side === 'defender' && config.stat === 'hp') {
            setTimeout(() => {
                updateCurrentHPFromRealHP();
            }, 100);
        }
    }

    /**
     * 個体値1→0の特別処理
     */
    handleSpecialIV1to0Case(pokemon, config, targetValue, direction) {
        if (pokemon.ivValues[config.stat] !== 1 || direction >= 0) return false;
        
        const statWith0IV = calculateStatWithParams(
            pokemon.baseStats[config.stat], 
            pokemon.level, 
            0, 
            pokemon.evValues[config.stat], 
            pokemon.natureModifiers[config.stat], 
            config.stat === 'hp'
        );
        
        if (statWith0IV <= targetValue) {
            pokemon.ivValues[config.stat] = 0;
            updateIVEVInputs(config.side, config.stat, 0, pokemon.evValues[config.stat]);
            updateStats(config.side);
            return true;
        }
        
        return false;
    }

    /**
     * 入力制限を更新（統合版）
     */
    updateInputLimits(side) {
        const pokemon = side === 'attacker' ? attackerPokemon : defenderPokemon;
        if (!pokemon.name) return;
        const stats = ['hp', 'a', 'b', 'c', 'd', 's'];
        stats.forEach(stat => {
            this.updateSingleStatLimits(side, stat, pokemon);
        });
    }

    /**
     * 個別ステータスの制限を更新
     */
    updateSingleStatLimits(side, stat, pokemon) {
        if (!pokemon.baseStats[stat] || pokemon.baseStats[stat] === 0) {
            return; // ポケモンが選択されていない場合は何もしない
        }
        
        const limits = calculateStatLimits(pokemon.baseStats[stat], pokemon.level, stat === 'hp');
        
        // メイン入力欄
        const mainId = `${side}Real${stat.toUpperCase()}`;
        this.setInputLimits(mainId, limits);
        
        // 詳細入力欄
        const detailId = `${side}DetailReal${stat.toUpperCase()}`;
        this.setInputLimits(detailId, limits);
    }

    /**
     * 個別入力欄の制限設定
     */
    setInputLimits(inputId, limits) {
        const input = document.getElementById(inputId);
        if (!input) return;
        
        input.setAttribute('min', limits.min);
        input.setAttribute('max', limits.max);
        
        // 現在値が範囲外の場合は修正
        const currentValue = parseInt(input.value) || 0;
        if (currentValue > 0) {
            if (currentValue < limits.min) {
                input.updateValueSilently ? input.updateValueSilently(limits.min) : (input.value = limits.min);
            } else if (currentValue > limits.max) {
                input.updateValueSilently ? input.updateValueSilently(limits.max) : (input.value = limits.max);
            }
        }
    }

    // ユーティリティメソッド（既存の関数を参照）
    calculateCurrentStat(pokemon, stat) {
        const level = pokemon.level;
        const baseStat = pokemon.baseStats[stat];
        const iv = pokemon.ivValues[stat];
        const ev = pokemon.evValues[stat];
        const natureModifier = pokemon.natureModifiers[stat] || 1.0;
        
        return calculateStatWithParams(baseStat, level, iv, ev, natureModifier, stat === 'hp');
    }

    findOptimalStats(pokemon, stat, targetValue) {
        return findOptimalStats(pokemon, stat, targetValue, pokemon.baseStats[stat], pokemon.level);
    }

    /**
     * 個体値優先の最適化処理
     * 実数値を上げる時：個体値31未満なら個体値を優先、31なら努力値
     * 実数値を下げる時：努力値を優先、0なら個体値
     */
    findOptimalStatsIVFirst(pokemon, stat, targetValue, direction) {
        const baseStat = pokemon.baseStats[stat];
        const level = pokemon.level;
        const currentIV = pokemon.ivValues[stat];
        const currentEV = pokemon.evValues[stat];
        const currentNature = pokemon.natureModifiers[stat] || 1.0;
        const isHP = stat === 'hp';       
        // 実数値を上げる場合（direction > 0）
        if (direction > 0) {
            return this.optimizeForIncrease(baseStat, level, isHP, currentIV, currentEV, currentNature, targetValue, stat);
        }
        // 実数値を下げる場合（direction < 0）
        else if (direction < 0) {
            return this.optimizeForDecrease(baseStat, level, isHP, currentIV, currentEV, currentNature, targetValue, stat);
        }
        // 方向が不明な場合は従来の処理
        else {
            return findOptimalStats(pokemon, stat, targetValue, baseStat, level);
        }
    }

    /**
     * 実数値を上げる場合の最適化（個体値優先）
     */
    optimizeForIncrease(baseStat, level, isHP, currentIV, currentEV, currentNature, targetValue, stat) {      
        // 1. 個体値が31未満の場合、まず個体値を上げる
        if (currentIV < 31) {       
            // 現在の努力値で個体値を上げて目標に到達できるかチェック
            for (let iv = currentIV + 1; iv <= 31; iv++) {
                const statValue = calculateStatWithParams(baseStat, level, iv, currentEV, currentNature, isHP);            
                if (statValue === targetValue) {

                    return { iv: iv, ev: currentEV, natureMod: currentNature };
                }
                if (statValue > targetValue) {
                    // 前の個体値で努力値調整を試す
                    const prevIV = iv - 1;
                    return this.adjustWithEV(baseStat, level, isHP, prevIV, currentEV, currentNature, targetValue, stat);
                }
            }  
            // 個体値31でも届かない場合、個体値31で努力値調整
            return this.adjustWithEV(baseStat, level, isHP, 31, currentEV, currentNature, targetValue, stat);
        }
        // 2. 個体値が31の場合、努力値を上げる
        else {
            return this.adjustWithEV(baseStat, level, isHP, currentIV, currentEV, currentNature, targetValue, stat);
        }
    }

    /**
     * 実数値を下げる場合の最適化（努力値優先）
     */
    optimizeForDecrease(baseStat, level, isHP, currentIV, currentEV, currentNature, targetValue, stat) {        
        // 1. 努力値が0より大きい場合、まず努力値を下げる
        if (currentEV > 0) {         
            // 現在の個体値で努力値を下げて目標に到達できるかチェック
            for (let ev = currentEV - 4; ev >= 0; ev -= 4) {
                const statValue = calculateStatWithParams(baseStat, level, currentIV, ev, currentNature, isHP);            
                if (statValue === targetValue) {
                    return { iv: currentIV, ev: ev, natureMod: currentNature };
                }
                if (statValue < targetValue) {
                    break;
                }
            }
        }
        // 2. 努力値を0にしても目標に届かない場合、個体値を下げる      
        if (currentIV > 0) {
            for (let iv = currentIV - 1; iv >= 0; iv--) {
                // 各個体値で最適な努力値を探す
                for (let ev = 0; ev <= 252; ev += 4) {
                    const statValue = calculateStatWithParams(baseStat, level, iv, ev, currentNature, isHP);
                    if (statValue === targetValue) {
                        return { iv: iv, ev: ev, natureMod: currentNature };
                    }
                }
            }
        }
        // どうしても達成できない場合は従来の処理にフォールバック
        return findOptimalStats({ 
            baseStats: { [stat]: baseStat }, 
            level: level, 
            ivValues: { [stat]: currentIV }, 
            evValues: { [stat]: currentEV }, 
            natureModifiers: { [stat]: currentNature } 
        }, stat, targetValue, baseStat, level);
    }

    /**
     * 指定された個体値で努力値を調整して目標値を探す
     */
    adjustWithEV(baseStat, level, isHP, iv, currentEV, currentNature, targetValue, stat) {       
        // 現在の努力値から上げる方向で探索
        for (let ev = currentEV; ev <= 252; ev += 4) {
            const statValue = calculateStatWithParams(baseStat, level, iv, ev, currentNature, isHP);           
            if (statValue === targetValue) {
                return { iv: iv, ev: ev, natureMod: currentNature };
            }
            if (statValue > targetValue) {
                break;
            }
        }
        
        // 努力値だけでは達成できない場合、性格変更を含む最適化
        return findOptimalStats({ 
            baseStats: { [stat]: baseStat }, 
            level: level, 
            ivValues: { [stat]: iv }, 
            evValues: { [stat]: currentEV }, 
            natureModifiers: { [stat]: currentNature } 
        }, stat, targetValue, baseStat, level);
    }

    applyStatResult(pokemon, config, result) {
        pokemon.ivValues[config.stat] = result.iv;
        pokemon.evValues[config.stat] = result.ev;
        
        if (result.changeNature && result.natureMod !== undefined && config.stat !== 'hp') {
            pokemon.natureModifiers[config.stat] = result.natureMod;
            this.updateNatureUI(config.side, config.stat, result.natureMod);
        }
        
        updateIVEVInputs(config.side, config.stat, result.iv, result.ev);
        updateStats(config.side);
    }

    updateNatureUI(side, stat, natureMod) {
        // 性格UI更新の処理（既存コードから移動）
        if ((side === 'attacker' && (stat === 'a' || stat === 'c')) ||
            (side === 'defender' && (stat === 'b' || stat === 'd'))) {
            updateMainNatureButtons(side, stat, natureMod);
        }
        
        const plusCheckbox = document.getElementById(`${side}${stat.toUpperCase()}Plus`);
        const minusCheckbox = document.getElementById(`${side}${stat.toUpperCase()}Minus`);
        
        if (plusCheckbox && minusCheckbox) {
            if (natureMod === 1.1) {
                plusCheckbox.checked = true;
                minusCheckbox.checked = false;
            } else if (natureMod === 0.9) {
                plusCheckbox.checked = false;
                minusCheckbox.checked = true;
            } else {
                plusCheckbox.checked = false;
                minusCheckbox.checked = false;
            }
        }
        
        updateNatureFromModifiers(side);
    }
}

// グローバルインスタンス
const realStatManager = new RealStatInputManager();

// 初期化時に呼び出す関数を更新
function setupRealStatInputListeners() {
    realStatManager.initializeRealStatInputs();
    setupHPRealStatChangeListener();
}

// HP実数値変更時の現在HP自動更新処理
function setupHPRealStatChangeListener() {
    // メイン画面のHP実数値入力欄
    const defenderRealHP = document.getElementById('defenderRealHP');
    if (defenderRealHP) {
        defenderRealHP.addEventListener('input', function() {
            updateCurrentHPFromRealHP();
        });
        
        defenderRealHP.addEventListener('change', function() {
            updateCurrentHPFromRealHP();
        });
    }
    
    // 詳細設定のHP実数値入力欄
    const defenderDetailRealHP = document.getElementById('defenderDetailRealHP');
    if (defenderDetailRealHP) {
        defenderDetailRealHP.addEventListener('input', function() {
            updateCurrentHPFromRealHP();
        });
        
        defenderDetailRealHP.addEventListener('change', function() {
            updateCurrentHPFromRealHP();
        });
    }
}

// HP実数値から現在HPを更新する
function updateCurrentHPFromRealHP() {
    const currentHPInput = document.getElementById('defenderCurrentHP');
    if (!currentHPInput) return;
    
    // メイン画面と詳細設定の両方からHP実数値を取得
    const mainRealHP = document.getElementById('defenderRealHP');
    const detailRealHP = document.getElementById('defenderDetailRealHP');
    
    let newMaxHP = 0;
    
    // メイン画面の値を優先
    if (mainRealHP && mainRealHP.value) {
        newMaxHP = parseInt(mainRealHP.value) || 0;
    } else if (detailRealHP && detailRealHP.value) {
        newMaxHP = parseInt(detailRealHP.value) || 0;
    }
    
    if (newMaxHP > 0) {
        const previousMaxHP = parseInt(currentHPInput.getAttribute('data-max-hp')) || 0;
        
        // HP実数値が変更された場合は常に現在HPを最大HPにリセット
        if (newMaxHP !== previousMaxHP) {
            currentHPInput.value = newMaxHP;
        }
        
        // 新しい最大HPを記録
        currentHPInput.setAttribute('data-max-hp', newMaxHP);
        currentHPInput.setAttribute('max', newMaxHP);
        currentHPInput.setAttribute('min', 1);
    }
}

// ポケモン選択時の制限更新
function updateAllRealStatInputLimits(side) {
    realStatManager.updateInputLimits(side);
}

// 個別ステータスの制限更新（新規追加）
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
        
        const currentValue = parseInt(mainInput.value) || 0;
        if (currentValue > 0) {
            if (currentValue < limits.min) {
                if (mainInput.updateValueSilently) {
                    mainInput.updateValueSilently(limits.min);
                } else {
                    mainInput.value = limits.min;
                }
            } else if (currentValue > limits.max) {
                if (mainInput.updateValueSilently) {
                    mainInput.updateValueSilently(limits.max);
                } else {
                    mainInput.value = limits.max;
                }
            }
        }
    }
    
    // 詳細設定の実数値入力欄
    const detailId = `${side}DetailReal${stat.toUpperCase()}`;
    const detailInput = document.getElementById(detailId);
    if (detailInput) {
        detailInput.setAttribute('min', limits.min);
        detailInput.setAttribute('max', limits.max);
        
        const currentValue = parseInt(detailInput.value) || 0;
        if (currentValue > 0) {
            if (currentValue < limits.min) {
                if (detailInput.updateValueSilently) {
                    detailInput.updateValueSilently(limits.min);
                } else {
                    detailInput.value = limits.min;
                }
            } else if (currentValue > limits.max) {
                if (detailInput.updateValueSilently) {
                    detailInput.updateValueSilently(limits.max);
                } else {
                    detailInput.value = limits.max;
                }
            }
        }
    }
}

// 制限クリア
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

// 結果が有効かチェックする関数
function isValidResult(result, targetValue, baseStat, level, isHP) {
  if (!result) return false;
  
  // 結果から実際の実数値を計算（性格補正も考慮）
  const actualStat = calculateStatWithParams(
    baseStat, 
    level, 
    result.iv, 
    result.ev, 
    result.natureMod || 1.0,  // ここが重要：result.natureModを使用
    isHP
  );
  
  // 目標値と一致するか確認
  return actualStat === targetValue;
}

// HP実数値を取得してpinch系の入力欄に設定する関数
function updatePinchHPValues() {
  // 攻撃側のHP実数値を取得
  const attackerHP = parseInt(document.getElementById('attackerDetailRealHP').value) || 0;
  
  if (attackerHP > 0) {
    // pinchUp（きしかいせい・じたばた）用
    const pinchUpMaxHP = document.getElementById('pinchUp_maxHP');
    if (pinchUpMaxHP) {
      pinchUpMaxHP.value = attackerHP;
    }
    
    // pinchDown（しおふき・ふんか）用
    const pinchDownCurrentHP = document.getElementById('pinchDown_currentHP');
    const pinchDownMaxHP = document.getElementById('pinchDown_maxHP');
    if (pinchDownCurrentHP) {
      pinchDownCurrentHP.value = attackerHP;
    }
    if (pinchDownMaxHP) {
      pinchDownMaxHP.value = attackerHP;
    }
  }
}

// 最適な個体値・努力値・性格補正を探す関数
function findOptimalStats(pokemon, stat, targetValue, baseStat, level) {
    const currentIV = pokemon.ivValues[stat];
    const currentEV = pokemon.evValues[stat];
    const currentNature = pokemon.natureModifiers[stat] || 1.0;
    const isHP = stat === 'hp';  
    // calculateOptimalIVEVを呼び出して最適解を探す
    const result = calculateOptimalIVEV(targetValue, baseStat, level, currentNature, isHP, currentIV, currentEV);
   
    return result;
}

// 現在のステータスを計算
function calculateCurrentStat(pokemon, stat) {
  const level = pokemon.level;
  const baseStat = pokemon.baseStats[stat];
  const iv = pokemon.ivValues[stat];
  const ev = pokemon.evValues[stat];
  const natureModifier = pokemon.natureModifiers[stat] || 1.0;
  
  return calculateStatWithParams(baseStat, level, iv, ev, natureModifier, stat === 'hp');
}

// パラメータから実数値を計算
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

// スピンボタンの動作に最適化した個体値・努力値計算
function calculateOptimalIVEV(targetRealStat, baseStat, level, natureModifier, isHP, currentIV, currentEV) { 
  // 実数値計算関数
  const calculateStat = (iv, ev, natureMod) => {
    return calculateStatWithParams(baseStat, level, iv, ev, natureMod, isHP);
  };
  
  // 現在の実数値
  const currentRealStat = calculateStat(currentIV, currentEV, natureModifier);
  
  // 実現可能性チェック
  const limits = calculateStatLimits(baseStat, level, isHP);
  if (targetRealStat < limits.min || targetRealStat > limits.max) {
    return null;
  }
  
  // 特殊ケース1: 性格補正1.0、個体値31、努力値252から実数値を上げる場合
  if (!isHP && natureModifier === 1.0 && currentIV === 31 && currentEV === 252 && targetRealStat > currentRealStat) {
    // 性格補正を1.1に変更して、努力値を減らして調整
    for (let ev = 252; ev >= 0; ev -= 4) {
      const stat = calculateStat(31, ev, 1.1);
      if (stat === targetRealStat) {
        const result = { iv: 31, ev: ev, natureMod: 1.1, changeNature: true };
        return result;
      }
      if (stat < targetRealStat) {
        // 目標値を超えた場合は一つ前の値を使用
        if (ev < 252) {
          return { iv: 31, ev: ev + 4, natureMod: 1.1, changeNature: true };
        }
        break;
      }
    }
  }
  
  // 特殊ケース2: 性格補正1.0、個体値0、努力値0から実数値を下げる場合
  if (!isHP && natureModifier === 1.0 && currentIV === 0 && currentEV === 0 && targetRealStat < currentRealStat) {
    // 性格補正を0.9に変更して、個体値を調整（努力値は0のまま）
    for (let iv = 0; iv <= 31; iv++) {
      const stat = calculateStat(iv, 0, 0.9);
      if (stat === targetRealStat) {
        return { iv: iv, ev: 0, natureMod: 0.9, changeNature: true };
      }
      if (stat > targetRealStat) {
        // 目標値を下回った場合は一つ前の値を使用
        if (iv > 0) {
          return { iv: iv - 1, ev: 0, natureMod: 0.9, changeNature: true };
        }
        break;
      }
    }
  }
  
  // 新しい特殊ケース: 性格補正0.9、個体値31、努力値252から実数値を上げる場合
  if (!isHP && natureModifier === 0.9 && currentIV === 31 && currentEV === 252 && targetRealStat > currentRealStat) {
    // 性格補正を1.0に変更して、努力値を減らして調整
    for (let ev = 252; ev >= 0; ev -= 4) {
      const stat = calculateStat(31, ev, 1.0);
      if (stat === targetRealStat) {
        const result = { iv: 31, ev: ev, natureMod: 1.0, changeNature: true };
        return result;
      }
      if (stat < targetRealStat) {
        // 目標値を下回った場合は一つ前の値を使用
        if (ev < 252) {
          const result = { iv: 31, ev: ev + 4, natureMod: 1.0, changeNature: true };
          return result;
        }
        break;
      }
    }
  }
  
  // 特殊ケース3: 性格補正0.9で実数値を下げる場合（個体値1→0の処理）
if (!isHP && natureModifier === 0.9 && targetRealStat < currentRealStat) { 
  // まず努力値を減らして調整を試す
  if (currentEV > 0) {
    for (let ev = currentEV - 4; ev >= 0; ev -= 4) {
      const stat = calculateStat(currentIV, ev, 0.9);
      if (stat === targetRealStat) {
        return { iv: currentIV, ev: ev, natureMod: 0.9 };
      }
      if (stat < targetRealStat) break;
    }
  }
  
  // 努力値を減らしても目標に届かない場合、個体値を減らす
  if (currentIV > 0) {
    for (let iv = currentIV - 1; iv >= 0; iv--) {
      // 各個体値で最適な努力値を探す
      for (let ev = 0; ev <= 252; ev += 4) {
        const stat = calculateStat(iv, ev, 0.9);
        if (stat === targetRealStat) {
          return { iv: iv, ev: ev, natureMod: 0.9 };
        }
      }
    }
    
    // 特別ケース：個体値1→0（実数値が同じでも許可）
    if (currentIV === 1) {
      const stat0 = calculateStat(0, currentEV, 0.9);
      const stat1 = calculateStat(1, currentEV, 0.9);
      if (stat0 === stat1) {
        return { iv: 0, ev: currentEV, natureMod: 0.9 };
      }
    }
  }
}
  
  // 実数値を上げる場合の処理
  if (targetRealStat > currentRealStat) {   
    // 性格補正0.9の場合は努力値を優先的に調整
    if (!isHP && natureModifier === 0.9) {      
      // まず努力値を増やして調整を試す（個体値は現在のまま）
      if (currentEV < 252) {
        for (let ev = currentEV + 4; ev <= 252; ev += 4) {
          const stat = calculateStat(currentIV, ev, 0.9);
          if (stat === targetRealStat) {
            return { iv: currentIV, ev: ev, natureMod: 0.9 };
          }
          if (stat > targetRealStat) {
            break;
          }
        }
      }
      
      // 努力値252でも届かない場合、個体値を上げる
      if (currentIV < 31) {
        for (let iv = currentIV + 1; iv <= 31; iv++) {
          // 努力値は0から252まで探索
          for (let ev = 0; ev <= 252; ev += 4) {
            const stat = calculateStat(iv, ev, 0.9);
            if (stat === targetRealStat) {
              return { iv: iv, ev: ev, natureMod: 0.9 };
            }
          }
        }
      }
      
      // 性格補正0.9では届かない場合、性格補正を上げる
      const higherNatureStat = calculateStat(31, 252, 1.0);
      if (higherNatureStat >= targetRealStat) {
        // 性格補正を1.0に変更して努力値を減らして調整
        for (let ev = 252; ev >= 0; ev -= 4) {
          const stat = calculateStat(31, ev, 1.0);
          if (stat === targetRealStat) {
            return { iv: 31, ev: ev, natureMod: 1.0, changeNature: true };
          }
        }
        
        // 努力値を減らしても目標に合わない場合、個体値も調整
        for (let iv = 0; iv <= 31; iv++) {
          for (let ev = 0; ev <= 252; ev += 4) {
            const stat = calculateStat(iv, ev, 1.0);
            if (stat === targetRealStat) {
              return { iv: iv, ev: ev, natureMod: 1.0, changeNature: true };
            }
          }
        }
      }
    } else {
      // 性格補正1.0または1.1の場合は個体値優先    
      // まず個体値を上げて調整を試す（努力値は現在のまま）
      if (currentIV < 31) {

        for (let iv = currentIV + 1; iv <= 31; iv++) {
          const stat = calculateStat(iv, currentEV, natureModifier);
          if (stat === targetRealStat) {
            return { iv: iv, ev: currentEV, natureMod: natureModifier };
          }
          if (stat > targetRealStat) {
            break;
          }
        }
      }
      
      // 個体値31の場合、または個体値を上げても届かない場合は努力値を増やす
      if (currentIV === 31 || currentEV < 252) {
        const useIV = currentIV === 31 ? 31 : currentIV;
        
        for (let ev = currentEV + 4; ev <= 252; ev += 4) {
          const stat = calculateStat(useIV, ev, natureModifier);
          if (stat === targetRealStat) {
            return { iv: useIV, ev: ev, natureMod: natureModifier };
          }
          if (stat > targetRealStat) {
            break;
          }
        }
      }
      
      // 個体値31、努力値252でも届かない場合は性格補正を上げる
      if (!isHP && natureModifier < 1.1) {
        const higherNatureStat = calculateStat(31, 252, natureModifier === 0.9 ? 1.0 : 1.1);
        if (higherNatureStat >= targetRealStat) {
          // 性格補正を上げて努力値を減らして調整
          const newNature = natureModifier === 0.9 ? 1.0 : 1.1;
          
          for (let ev = 252; ev >= 0; ev -= 4) {
            const stat = calculateStat(31, ev, newNature);
            if (stat === targetRealStat) {
              return { iv: 31, ev: ev, natureMod: newNature, changeNature: true };
            }
          }
          
          // 個体値優先で探索
          for (let iv = 0; iv <= 31; iv++) {
            for (let ev = 0; ev <= 252; ev += 4) {
              const stat = calculateStat(iv, ev, newNature);
              if (stat === targetRealStat) {
                return { iv: iv, ev: ev, natureMod: newNature, changeNature: true };
              }
            }
          }
        }
      }
    }
  }
  
  // 実数値を下げる場合の処理
  if (targetRealStat < currentRealStat) {
    // 性格補正が不利（0.9）ではない場合、まず性格補正を変更できるか検討
    if (!isHP && natureModifier > 0.9) {
      // 現在の個体値・努力値で性格補正を下げた場合の実数値を計算
      const lowerNatureStat = calculateStat(currentIV, currentEV, natureModifier === 1.1 ? 1.0 : 0.9);
      if (lowerNatureStat === targetRealStat) {
        return { iv: currentIV, ev: currentEV, natureMod: natureModifier === 1.1 ? 1.0 : 0.9, changeNature: true };
      }
    }
    
    // 努力値を減らす
    if (currentEV > 0) {
      for (let ev = currentEV - 4; ev >= 0; ev -= 4) {
        const stat = calculateStat(currentIV, ev, natureModifier);
        if (stat === targetRealStat) {
          return { iv: currentIV, ev: ev, natureMod: natureModifier };
        }
        if (stat < targetRealStat) break;
      }
    }
    
    // 個体値を減らす
    if (currentIV > 0) {
      for (let iv = currentIV - 1; iv >= 0; iv--) {
        const stat = calculateStat(iv, currentEV, natureModifier);
        if (stat === targetRealStat) {
          return { iv: iv, ev: currentEV, natureMod: natureModifier };
        }
        if (stat < targetRealStat) break;
      }
    }
  }
  
  // 全探索（最適解を見つける）- 性格補正による優先順位変更
  let bestResult = null;
  let minChanges = Infinity;
  
  const natureOptions = isHP ? [1.0] : [0.9, 1.0, 1.1];
  
  for (const natureMod of natureOptions) {
    for (let iv = 0; iv <= 31; iv++) {
      for (let ev = 0; ev <= 252; ev += 4) {
        const stat = calculateStat(iv, ev, natureMod);
        if (stat === targetRealStat) {
          // 変更数を計算（性格補正0.9の場合は努力値優先、それ以外は個体値優先）
          let changes = 0;
          if (natureModifier === 0.9) {
            // 性格補正0.9の場合：努力値 < 個体値 < 性格の優先順位
            if (ev !== currentEV) changes += 1;  // 努力値の優先度を最高に
            if (iv !== currentIV) changes += 2;  // 個体値の優先度を中に
            if (natureMod !== natureModifier) changes += 3;  // 性格の優先度を最低に
          } else {
            // その他の場合：個体値 < 努力値 < 性格の優先順位
            if (iv !== currentIV) changes += 1;  // 個体値の優先度を最高に
            if (ev !== currentEV) changes += 2;  // 努力値の優先度を中に
            if (natureMod !== natureModifier) changes += 3;  // 性格の優先度を最低に
          }
          
          if (changes < minChanges) {
            minChanges = changes;
            bestResult = { 
              iv: iv, 
              ev: ev, 
              natureMod: natureMod, 
              changeNature: natureMod !== natureModifier 
            };
          }
        }
      }
    }
  }
  return bestResult;
}

// 実数値の上限・下限を計算
function calculateStatLimits(baseStat, level, isHP = false) {
  if (isHP) {
    // HPの場合
    const minBase = baseStat * 2 + 0 + 0; // IV0, EV0
    const minLevel = Math.floor(minBase * level / 100);
    const minStat = minLevel + level + 10;
    
    const maxBase = baseStat * 2 + 31 + Math.floor(252 / 4); // IV31, EV252
    const maxLevel = Math.floor(maxBase * level / 100);
    const maxStat = maxLevel + level + 10;
    
    const result = { min: minStat, max: maxStat };;
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

// 個体値・努力値のUIを更新する関数
function updateIVEVInputs(side, stat, iv, ev) {
  const statUpper = stat.toUpperCase();
  
  // メイン画面の個体値
  const mainIvInput = document.getElementById(`${side}Iv${statUpper}`);
  if (mainIvInput) {
    mainIvInput.value = iv;
    updateIVButton(mainIvInput);
  }
  
  // メイン画面の努力値
  const mainEvInput = document.getElementById(`${side}Ev${statUpper}`);
  if (mainEvInput) {
    mainEvInput.value = ev;
    updateEVButton(mainEvInput);
  }
  
  // 詳細設定の個体値
  const detailIvInput = document.getElementById(`${side}DetailIv${statUpper}`);
  if (detailIvInput) {
    detailIvInput.value = iv;
    updateDetailIVButton(detailIvInput);
  }
  
  // 詳細設定の努力値
  const detailEvInput = document.getElementById(`${side}DetailEv${statUpper}`);
  if (detailEvInput) {
    detailEvInput.value = ev;
    updateDetailEVButton(detailEvInput);
  }
  
  // ポケモンオブジェクトの値も更新
  const pokemon = side === 'attacker' ? attackerPokemon : defenderPokemon;
  pokemon.ivValues[stat] = iv;
  pokemon.evValues[stat] = ev;
}

// 全ての実数値入力欄の制限を更新する関数
function updateAllRealStatInputLimits(side) {
  const stats = ['hp', 'a', 'b', 'c', 'd', 's'];
  stats.forEach(stat => {
    updateRealStatInputLimits(side, stat);
  });
}

// 個別ステータスの制限更新（新規追加）
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
        
        const currentValue = parseInt(mainInput.value) || 0;
        if (currentValue > 0) {
            if (currentValue < limits.min) {
                if (mainInput.updateValueSilently) {
                    mainInput.updateValueSilently(limits.min);
                } else {
                    mainInput.value = limits.min;
                }
            } else if (currentValue > limits.max) {
                if (mainInput.updateValueSilently) {
                    mainInput.updateValueSilently(limits.max);
                } else {
                    mainInput.value = limits.max;
                }
            }
        }
    }
    
    // 詳細設定の実数値入力欄
    const detailId = `${side}DetailReal${stat.toUpperCase()}`;
    const detailInput = document.getElementById(detailId);
    if (detailInput) {
        detailInput.setAttribute('min', limits.min);
        detailInput.setAttribute('max', limits.max);
        
        const currentValue = parseInt(detailInput.value) || 0;
        if (currentValue > 0) {
            if (currentValue < limits.min) {
                if (detailInput.updateValueSilently) {
                    detailInput.updateValueSilently(limits.min);
                } else {
                    detailInput.value = limits.min;
                }
            } else if (currentValue > limits.max) {
                if (detailInput.updateValueSilently) {
                    detailInput.updateValueSilently(limits.max);
                } else {
                    detailInput.value = limits.max;
                }
            }
        }
    }
}

// 入力制限をクリアする関数
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

// ========================
// 6. ダメージ計算
// ========================

// 威力計算
function calculatePower(move) {
    // きしかいせい・じたばた
    if (move.class === 'pinch_up') {
        const currentHP = parseInt(document.getElementById('pinchUp_currentHP')?.value) || 1;
        const maxHP = parseInt(document.getElementById('pinchUp_maxHP')?.value) || 100;
        const HPrate = Math.floor(currentHP * 48 / maxHP);
        
        if (HPrate >= 33) return 20;
        else if (HPrate >= 17) return 40;
        else if (HPrate >= 10) return 80;
        else if (HPrate >= 5) return 100;
        else if (HPrate >= 2) return 150;
        else return 200;
    }
    // ふんか・しおふき
    else if (move.class === 'pinch_down') {
        const currentHP = parseInt(document.getElementById('pinchDown_currentHP').value);
        const maxHP = parseInt(document.getElementById('pinchDown_maxHP').value);
        const pinchDownPower = Math.floor(150 * currentHP / maxHP);
        return pinchDownPower;
    }

    else if (move.class === 'awaken_power'){
        return calculateHiddenPowerBP();
    }

    return move.power || 0;
}

// めざめるパワーの威力計算
function calculateHiddenPowerBP() {
    // 攻撃側ポケモンの個体値を取得（正しい順序：H-A-B-C-D-S）
    const ivs = {
        hp: parseInt(document.getElementById('attackerDetailIvHP').value),
        a: parseInt(document.getElementById('attackerDetailIvA').value),
        b: parseInt(document.getElementById('attackerDetailIvB').value),
        c: parseInt(document.getElementById('attackerDetailIvC').value),
        d: parseInt(document.getElementById('attackerDetailIvD').value),
        s: parseInt(document.getElementById('attackerDetailIvS').value)
    };
    
    // 威力計算 (各個体値を4で割った余りが2以上かどうか)
    let powerSum = 0;
    if (ivs.hp % 4 >= 2) powerSum += 1;
    if (ivs.a % 4 >= 2) powerSum += 2;
    if (ivs.b % 4 >= 2) powerSum += 4;
    if (ivs.s % 4 >= 2) powerSum += 8;   // SとCの順序を修正
    if (ivs.c % 4 >= 2) powerSum += 16;  // SとCの順序を修正
    if (ivs.d % 4 >= 2) powerSum += 32;
    
    const power = Math.floor(powerSum * 40 / 63) + 30;
    return power;
}


// めざめるパワーのタイプ計算
function calculateHiddenPowerType() {
    // 攻撃側ポケモンの個体値を取得（正しい順序：H-A-B-C-D-S）
    const ivs = {
        hp: parseInt(document.getElementById('attackerDetailIvHP').value),
        a: parseInt(document.getElementById('attackerDetailIvA').value),
        b: parseInt(document.getElementById('attackerDetailIvB').value),
        c: parseInt(document.getElementById('attackerDetailIvC').value),
        d: parseInt(document.getElementById('attackerDetailIvD').value),
        s: parseInt(document.getElementById('attackerDetailIvS').value)
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

// 3世代のタイプから物理/特殊を判定
function getGen3CategoryByType(type) {
    // 物理タイプ
    const physicalTypes = ['ノーマル', 'かくとう', 'どく', 'じめん', 'ひこう', 'むし', 'いわ', 'ゴースト', 'はがね'];
    
    // 特殊タイプ
    const specialTypes = ['ほのお', 'みず', 'でんき', 'くさ', 'こおり', 'エスパー', 'ドラゴン', 'あく'];
    
    if (physicalTypes.includes(type)) {
        return 'Physical';
    } else if (specialTypes.includes(type)) {
        return 'Special';
    } else {
        // デフォルトは特殊
        return 'Special';
    }
}

// めざめるパワーのタイプ更新が必要かチェック
function updateHiddenPowerIfNeeded() {
   
    // 現在選択されている技がめざめるパワーの場合
    if (currentMove && currentMove.class === 'awaken_power') {
        const newType = calculateHiddenPowerType();
        const newPower = calculateHiddenPowerBP();
        
        currentMove.type = newType;
        currentMove.category = getGen3CategoryByType(newType);
        currentMove.power = newPower;
    }
    
    // 複数ターン技でめざめるパワーがある場合
    for (let i = 0; i < multiTurnMoves.length; i++) {
        if (multiTurnMoves[i] && multiTurnMoves[i].class === 'awaken_power') {
            const newType = calculateHiddenPowerType();
            const newPower = calculateHiddenPowerBP();
            
            multiTurnMoves[i].type = newType;
            multiTurnMoves[i].category = getGen3CategoryByType(newType);
            multiTurnMoves[i].power = newPower;  // ← この行を追加
        }
    }
}

// 定数ダメージ計算
function calculateStatusDamage(maxHP, statusType, turn) {
    switch (statusType) {
        case 'burn':
        case 'poison':
            return Math.floor(maxHP / 8); // 1/8ダメージ
        case 'badlypoison':
            return Math.floor(maxHP * turn / 16); // turn/16ダメージ
        default:
            return 0;
    }
}

// まきびしダメージ計算
function calculateSpikesDamage(maxHP, spikesLevel, turn) {
    // 1ターン目のみダメージ
    if (turn !== 1) return 0;
    
    switch (spikesLevel) {
        case 1:
            return Math.floor(maxHP / 8); // 1/8ダメージ
        case 2:
            return Math.floor(maxHP / 6); // 1/6ダメージ
        case 3:
            return Math.floor(maxHP / 4); // 1/4ダメージ
        default:
            return 0;
    }
}

// 天候による定数ダメージ計算
function calculateWeatherDamage(maxHP, pokemonTypes, weather) {
    if (weather === 'sandstorm') {
        // いわ・じめん・はがねタイプ以外は1/16ダメージ
        const immuneTypes = ['いわ', 'じめん', 'はがね'];
        const isImmune = pokemonTypes.some(type => immuneTypes.includes(type));
        return isImmune ? 0 : Math.floor(maxHP / 16);
    } else if (weather === 'hail') {
        // こおりタイプ以外は1/16ダメージ
        const isImmune = pokemonTypes.includes('こおり');
        return isImmune ? 0 : Math.floor(maxHP / 16);
    }
    return 0;
}

// 総定数ダメージ計算
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

// のろいダメージ計算（最大HPの1/4）
function calculateCurseDamage(maxHP) {
    return Math.floor(maxHP / 4);
}

// あくむダメージ計算（最大HPの1/4）
function calculateNightmareDamage(maxHP) {
    return Math.floor(maxHP / 4);
}

// やどりぎダメージ計算（最大HPの1/8）
function calculateLeechSeedDamage(maxHP) {
    return Math.floor(maxHP / 8);
}

// ダメージ計算本体
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
    finalPower = Math.floor(finalPower * 2);
  }
  else if (document.getElementById('moukaCheck').checked && moveType === 'ほのお') {
    // もうか
    finalPower = Math.floor(finalPower * 2);
  }
  else if (document.getElementById('gekiryuuCheck').checked && moveType === 'みず') {
    // げきりゅう
    finalPower = Math.floor(finalPower * 2);
  }
  else if (document.getElementById('mushiNoShiraseCheck').checked && moveType === 'むし') {
    // むしのしらせ
    finalPower = Math.floor(finalPower * 2);
  }
  
  // じばく・だいばくはつの防御半減
  if (currentMove && currentMove.class === "b_harf") {
    finalDefense = Math.floor(finalDefense / 2);
  }
  
  // ランク補正
  const getRankMultiplier = (rankValue) => {
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
  };
  
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
  if (typeEffectiveness > 1.0) {
    // 抜群
    proc = Math.floor(proc * 20 / 10);
  } else if (typeEffectiveness < 1.0) {
    // 半減
    proc = Math.floor(proc * 5 / 10);
  }
  
  // 乱数(最終ダメージ)
  const baseDamage = Math.max(1, proc);
  const minDamage = Math.floor(baseDamage * 85 / 100);
  const maxDamage = baseDamage;
  
  return [Math.max(1, minDamage), maxDamage];
}

// ========================
// 7. 結果表示
// ========================

// ダメージ保持の切り替え
function toggleDamageKeep() {
   const keepDamage = document.getElementById('keepDamageCheck').checked;
   
   if (!keepDamage) {
       // 履歴をクリア
       damageHistory = [];
   }
}

// 乱数計算
function performDamageCalculationEnhanced() {
    // ツール情報非表示
    document.querySelector('.tool-info').style.display = 'none';
    // ポワルンのタイプを最新の天候に更新
    updateCastformTypeIfNeeded();

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

// ========================
// HPバー作成関数
// ========================

function createHPBar(minDamage, maxDamage, totalHP, keepDamage = false) {
    const maxDots = 48;
    
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
    const constantDamage = calculateTotalConstantDamage(totalHP, defenderPokemon.types, 1);
    
    // ダメージに定数ダメージを追加
    displayMinDamage += constantDamage;
    displayMaxDamage += constantDamage;
    
    // アイテム効果を考慮
    const defenderItem = defenderPokemon.item;
    let healInfo = '';
    let effectiveMinDamage = displayMinDamage;
    let effectiveMaxDamage = displayMaxDamage;
    
    if (defenderItem) {
        if (defenderItem.name === 'オボンのみ') {
            // HP50%以下で30回復
            const halfHP = totalHP / 2;
            if (totalHP - effectiveMinDamage <= halfHP) {
                healInfo = ' (オボンのみ発動後)';
                effectiveMinDamage = Math.max(0, effectiveMinDamage - 30);
                effectiveMaxDamage = Math.max(0, effectiveMaxDamage - 30);
            }
        } else if (isFigyBerry(defenderItem.name)) {
            // HP50%以下で最大HPの1/8回復
            const halfHP = totalHP / 2;
            const healAmount = Math.floor(totalHP / 8);
            if (totalHP - effectiveMinDamage <= halfHP) {
                healInfo = ` (${defenderItem.name}発動後)`;
                effectiveMinDamage = Math.max(0, effectiveMinDamage - healAmount);
                effectiveMaxDamage = Math.max(0, effectiveMaxDamage - healAmount);
            }
        } else if (defenderItem.name === 'たべのこし') {
            // 毎ターン1/16回復
            const healAmount = Math.floor(totalHP / 16);
            healInfo = ' (たべのこし考慮)';
            effectiveMinDamage = Math.max(0, effectiveMinDamage - healAmount);
            effectiveMaxDamage = Math.max(0, effectiveMaxDamage - healAmount);
        }
    }
    
    // 定数ダメージの表示情報を追加
    if (constantDamage > 0) {
    const damageDetails = [];
    
    // 状態異常ダメージ
    const statusType = document.getElementById('statusDamageSelect').value;
    if (statusType !== 'none') {
        const statusNames = {
            'burn': 'やけど',
            'poison': 'どく', 
            'badlypoison': 'もうどく'
        };
        const statusDamage = calculateStatusDamage(totalHP, statusType, 1);
        if (statusDamage > 0) {
            damageDetails.push(`${statusNames[statusType]} -${statusDamage}`);
        }
    }
    
    // まきびしダメージ
    const spikesLevel = parseInt(document.getElementById('spikesLevel').value) || 0;
    const spikesDamage = calculateSpikesDamage(totalHP, spikesLevel, 1);
    if (spikesDamage > 0) {
        damageDetails.push(`まきびし -${spikesDamage}`);
    }
    
    // のろいダメージ
    const curseSelect = document.getElementById('curseSelect');
    if (curseSelect && curseSelect.value !== 'none') {
        const curseDamage = calculateCurseDamage(totalHP);
        damageDetails.push(`のろい -${curseDamage}`);
    }
    
    // あくむダメージ
    const nightmareSelect = document.getElementById('nightmareSelect');
    if (nightmareSelect && nightmareSelect.value !== 'none') {
        const nightmareDamage = calculateNightmareDamage(totalHP);
        damageDetails.push(`あくむ -${nightmareDamage}`);
    }
    
    // やどりぎダメージ
    const leechSeedSelect = document.getElementById('leechSeedSelect');
    if (leechSeedSelect && leechSeedSelect.value !== 'none') {
        const leechSeedDamage = calculateLeechSeedDamage(totalHP);
        damageDetails.push(`やどりぎ -${leechSeedDamage}`);
    }
    
    // 天候ダメージ
    const weather = document.getElementById('weatherSelect').value;
    const weatherDamage = calculateWeatherDamage(totalHP, defenderPokemon.types, weather);
    if (weatherDamage > 0) {
        const weatherNames = {
            'sandstorm': 'すなあらし',
            'hail': 'あられ'
        };
        damageDetails.push(`${weatherNames[weather]} -${weatherDamage}`);
    }
    
    if (damageDetails.length > 0) {
        constantDamageInfo = `<br>(${damageDetails.join(', ')})`;
    }
}
    
    const remainHPAfterMinDamage = Math.max(0, totalHP - effectiveMinDamage);
    const remainHPAfterMaxDamage = Math.max(0, totalHP - effectiveMaxDamage);
    
    const remainMinDots = Math.ceil((remainHPAfterMinDamage / totalHP) * maxDots);
    const remainMaxDots = Math.ceil((remainHPAfterMaxDamage / totalHP) * maxDots);
    
    const remainMinPercent = (remainHPAfterMinDamage / totalHP * 100).toFixed(1);
    const remainMaxPercent = (remainHPAfterMaxDamage / totalHP * 100).toFixed(1);
    
    const dotPercentage = 100 / maxDots;
    const minDotPercent = remainMinDots * dotPercentage;
    const maxDotPercent = remainMaxDots * dotPercentage;
    
    function generateLayers() {
        let layers = '';
        
        if (remainMinDots >= 25 && remainMaxDots < 25) {
            layers += `<div style="height: 100%; width: ${maxDotPercent}%; background-color: #f8e038 !important; position: absolute; left: 0; top: 0; z-index: 10;"></div>`;
            const halfDotPercent = 24 * dotPercentage;
            layers += `<div style="height: 100%; width: ${halfDotPercent}%; background-color: #c8a808 !important; position: absolute; left: 0; top: 0; z-index: 9;"></div>`;
            layers += `<div style="height: 100%; width: ${minDotPercent}%; background-color: #58d080 !important; position: absolute; left: 0; top: 0; z-index: 8;"></div>`;
        } else if (remainMinDots >= 25 && remainMaxDots >= 25) {
            layers += `<div style="height: 100%; width: ${maxDotPercent}%; background-color: #70f8a8 !important; position: absolute; left: 0; top: 0; z-index: 10;"></div>`;
            layers += `<div style="height: 100%; width: ${minDotPercent}%; background-color: #58d080 !important; position: absolute; left: 0; top: 0; z-index: 8;"></div>`;
        } else if (remainMinDots >= 10 && remainMaxDots < 10) {
            layers += `<div style="height: 100%; width: ${maxDotPercent}%; background-color: #f85838 !important; position: absolute; left: 0; top: 0; z-index: 10;"></div>`;
            const fifthDotPercent = 9 * dotPercentage;
            layers += `<div style="height: 100%; width: ${fifthDotPercent}%; background-color: #a84048 !important; position: absolute; left: 0; top: 0; z-index: 9;"></div>`;
            layers += `<div style="height: 100%; width: ${minDotPercent}%; background-color: #c8a808 !important; position: absolute; left: 0; top: 0; z-index: 8;"></div>`;
        } else if (remainMinDots >= 10 && remainMinDots < 25 && remainMaxDots >= 10 && remainMaxDots < 25) {
            layers += `<div style="height: 100%; width: ${maxDotPercent}%; background-color: #f8e038 !important; position: absolute; left: 0; top: 0; z-index: 10;"></div>`;
            layers += `<div style="height: 100%; width: ${minDotPercent}%; background-color: #c8a808 !important; position: absolute; left: 0; top: 0; z-index: 8;"></div>`;
        } else if (remainMinDots < 10 && remainMaxDots < 10) {
            layers += `<div style="height: 100%; width: ${maxDotPercent}%; background-color: #f85838 !important; position: absolute; left: 0; top: 0; z-index: 10;"></div>`;
            layers += `<div style="height: 100%; width: ${minDotPercent}%; background-color: #a84048 !important; position: absolute; left: 0; top: 0; z-index: 8;"></div>`;
        }
        
        return layers;
    }
    
    function generateDotMarkers() {
        let markers = '';
        const dotWidth = 100 / maxDots;
        
        for (let i = 1; i < maxDots; i++) {
            const position = i * dotWidth;
            markers += `<div style="height: 100%; width: 1px; background-color: rgba(0,0,0,0.2); position: absolute; left: ${position}%; top: 0; z-index: 20;"></div>`;
        }
        
        return markers;
    }
    
    let hpBarHtml = '';
    
    if (remainHPAfterMaxDamage == remainHPAfterMinDamage) {
        hpBarHtml = `
        <div style="margin: 10px 0; width: 100%; position: relative;">
          <div style="height: 15px; width: 100%; background-color: #506858; border-radius: 5px; position: relative; overflow: hidden;">
            ${generateLayers()}
            ${generateDotMarkers()}
          </div>
          <div style="text-align: center; margin-top: 3px; font-size: 0.85em; color: #777;">
            <div>HP: ${remainHPAfterMaxDamage}/${totalHP} (${remainMaxPercent}%)${healInfo}</div>
            <div>ドット: [${remainMaxDots}/48]</div>
          </div>
        </div>
        `;
    } else {
        hpBarHtml = `
        <div style="margin: 10px 0; width: 100%; position: relative;">
          <div style="height: 15px; width: 100%; background-color: #506858; border-radius: 5px; position: relative; overflow: hidden;">
            ${generateLayers()}
            ${generateDotMarkers()}
          </div>
          <div style="text-align: center; margin-top: 3px; font-size: 0.85em; color: #777;">
            <div>HP: ${remainHPAfterMaxDamage}~${remainHPAfterMinDamage}/${totalHP} (${remainMaxPercent}%~${remainMinPercent}%)${healInfo}</div>
            <div>ドット: [${remainMaxDots}~${remainMinDots}/48]</div>
          </div>
        </div>
        `;
    }
    
    return hpBarHtml;
}

// 確定n発、乱数n発のテキスト
function calculateRandText(displayMinDamage, displayMaxDamage, defenderHP, currentMove) {
    if (displayMinDamage === 0 && displayMaxDamage === 0) {
        return { hits: 0, percent: "0.0", randLevel: "" };
    }
    
    // みがわり仮定かチェック
    const isSubstitute = document.getElementById('substituteCheck')?.checked || false;
    let targetHP = defenderHP;
    
    if (isSubstitute) {
        targetHP = Math.floor(defenderHP / 4);
    } else {
        const currentHPInput = document.getElementById('defenderCurrentHP');
        if (currentHPInput && currentHPInput.value) {
            targetHP = parseInt(currentHPInput.value) || defenderHP;
        }
    }
    
    // 連続技の特別処理
    if (currentMove) {
        if (currentMove.class === 'multi_hit') {
            const hitCountSelect = document.getElementById('multiHitCount');
            const selectedHitCount = hitCountSelect ? hitCountSelect.value : '2-5';
            
            if (selectedHitCount === '2-5') {
                // 2-5回の場合は統合版の計算を使用
                const singleMinDamage = Math.floor(displayMinDamage / 2);
                const singleMaxDamage = Math.floor(displayMaxDamage / 5);
                return calculateMultiHitRandTextUnified(singleMinDamage, singleMaxDamage, targetHP, isSubstitute);
            } else {
                // 固定回数の場合
                const hitCount = parseInt(selectedHitCount);
                return calculateFixedMultiHitRandText(displayMinDamage, displayMaxDamage, targetHP, hitCount, isSubstitute);
            }
        } else if (currentMove.class === 'two_hit') {
            return calculateTwoHitRandText(displayMinDamage, displayMaxDamage, targetHP, isSubstitute);
        }
    }
    
    // 通常技の処理（既存のcalculateRandTextロジック）
    const effectiveMinDamage = displayMinDamage;
    const effectiveMaxDamage = displayMaxDamage;
    
    if (effectiveMinDamage >= targetHP) {
        return {
            hits: 1,
            percent: null,
            randLevel: "確定",
            effectiveMinDamage: effectiveMinDamage,
            effectiveMaxDamage: effectiveMaxDamage,
            isSubstitute: isSubstitute,
            targetHP: targetHP
        };
    }
    
    // 通常技の乱数計算（既存ロジック）
    const minHits = effectiveMaxDamage > 0 ? Math.ceil(targetHP / effectiveMaxDamage) : Infinity;
    const maxHits = effectiveMinDamage > 0 ? Math.ceil(targetHP / effectiveMinDamage) : Infinity;
    
    if (!isFinite(minHits) || !isFinite(maxHits)) {
        return { hits: 0, percent: "0.0", randLevel: "不可", isSubstitute: isSubstitute, targetHP: targetHP };
    }
    
    let knockoutPercent = 0;
    
    if (minHits === 1) {
        if (effectiveMaxDamage >= targetHP) {
            const successfulOutcomes = Math.max(0, effectiveMaxDamage - Math.max(effectiveMinDamage, targetHP) + 1);
            const totalOutcomes = effectiveMaxDamage - effectiveMinDamage + 1;
            knockoutPercent = (successfulOutcomes / totalOutcomes) * 100;
        } else {
            knockoutPercent = 0;
        }
    } else if (minHits === 2) {
        const totalOutcomes = Math.pow(effectiveMaxDamage - effectiveMinDamage + 1, 2);
        let successfulOutcomes = 0;
        
        for (let dmg1 = effectiveMinDamage; dmg1 <= effectiveMaxDamage; dmg1++) {
            const requiredDmg2 = targetHP - dmg1;
            
            if (requiredDmg2 <= 0) {
                successfulOutcomes += effectiveMaxDamage - effectiveMinDamage + 1;
            } else if (requiredDmg2 <= effectiveMaxDamage) {
                successfulOutcomes += Math.max(0, effectiveMaxDamage - Math.max(effectiveMinDamage, requiredDmg2) + 1);
            }
        }
        
        knockoutPercent = (successfulOutcomes / totalOutcomes) * 100;
    } else {
        const avgDamage = (effectiveMinDamage + effectiveMaxDamage) / 2;
        const totalDamageNeeded = targetHP;
        const minTotalDamage = effectiveMinDamage * minHits;
        const maxTotalDamage = effectiveMaxDamage * minHits;
        
        if (minTotalDamage >= totalDamageNeeded) {
            knockoutPercent = 95.0;
        } else if (maxTotalDamage < totalDamageNeeded) {
            knockoutPercent = 5.0;
        } else {
            const ratio = (maxTotalDamage - totalDamageNeeded) / (maxTotalDamage - minTotalDamage);
            knockoutPercent = 5.0 + ratio * 90.0;
        }
    }
    
    knockoutPercent = Math.round(knockoutPercent * 10) / 10;
    knockoutPercent = Math.max(0, Math.min(100, knockoutPercent));
    
    let randLevelText = "";
    
    if (effectiveMinDamage >= targetHP) {
        randLevelText = "確定";
        knockoutPercent = 100.0;
    } else {
        if (knockoutPercent >= 93.75) {
            randLevelText = "超高乱数";
        } else if (knockoutPercent >= 75.0) {
            randLevelText = "高乱数";
        } else if (knockoutPercent >= 62.5) {
            randLevelText = "中高乱数";
        } else if (knockoutPercent >= 37.5) {
            randLevelText = "中乱数";
        } else if (knockoutPercent >= 25.0) {
            randLevelText = "中低乱数";
        } else if (knockoutPercent > 6.3) {
            randLevelText = "低乱数";
        } else if (knockoutPercent > 0) {
            randLevelText = "超低乱数";
        } else {
            const requiredHits = Math.ceil(targetHP / effectiveMinDamage/2);
            return {
                hits: requiredHits,
                percent: null,
                randLevel: "確定",
                effectiveMinDamage: effectiveMinDamage,
                effectiveMaxDamage: effectiveMaxDamage,
                isSubstitute: isSubstitute,
                targetHP: targetHP
            };
        }
    }
    
    return {
        hits: minHits,
        percent: knockoutPercent === 100.0 ? null : knockoutPercent.toFixed(1),
        randLevel: randLevelText,
        effectiveMinDamage: effectiveMinDamage,
        effectiveMaxDamage: effectiveMaxDamage,
        isSubstitute: isSubstitute,
        targetHP: targetHP
    };
}

// 固定回数連続技の乱数計算
// calculateRandText関数の修正版（script.js内の該当部分を置き換え）

function calculateRandText(displayMinDamage, displayMaxDamage, defenderHP, currentMove) {
    if (displayMinDamage === 0 && displayMaxDamage === 0) {
        return { hits: 0, percent: "0.0", randLevel: "" };
    }
    
    // みがわり仮定かチェック
    const isSubstitute = document.getElementById('substituteCheck')?.checked || false;
    let targetHP = defenderHP;
    
    if (isSubstitute) {
        targetHP = Math.floor(defenderHP / 4);
    } else {
        const currentHPInput = document.getElementById('defenderCurrentHP');
        if (currentHPInput && currentHPInput.value) {
            targetHP = parseInt(currentHPInput.value) || defenderHP;
        }
    }
    
    // 連続技の特別処理
    if (currentMove) {
        if (currentMove.class === 'multi_hit') {
            const hitCountSelect = document.getElementById('multiHitCount');
            const selectedHitCount = hitCountSelect ? hitCountSelect.value : '2-5';
            
            if (selectedHitCount === '2-5') {
                // 2-5回の場合は統合版の計算を使用
                const singleMinDamage = Math.floor(displayMinDamage / 2);
                const singleMaxDamage = Math.floor(displayMaxDamage / 5);
                return calculateMultiHitRandTextUnified(singleMinDamage, singleMaxDamage, targetHP, isSubstitute);
            } else {
                // 固定回数の場合
                const hitCount = parseInt(selectedHitCount);
                return calculateFixedMultiHitRandText(displayMinDamage, displayMaxDamage, targetHP, hitCount, isSubstitute);
            }
        } else if (currentMove.class === 'two_hit') {
            return calculateTwoHitRandText(displayMinDamage, displayMaxDamage, targetHP, isSubstitute);
        }
    }
    
    // 通常技の処理
    const effectiveMinDamage = displayMinDamage;
    const effectiveMaxDamage = displayMaxDamage;
    
    // ★修正: 確定1発判定を最初に行う
    if (effectiveMinDamage >= targetHP) {
        return {
            hits: 1,
            percent: null,
            randLevel: "確定",
            effectiveMinDamage: effectiveMinDamage,
            effectiveMaxDamage: effectiveMaxDamage,
            isSubstitute: isSubstitute,
            targetHP: targetHP
        };
    }
    
    // 必要打数計算
    const minHits = effectiveMaxDamage > 0 ? Math.ceil(targetHP / effectiveMaxDamage) : Infinity;
    const maxHits = effectiveMinDamage > 0 ? Math.ceil(targetHP / effectiveMinDamage) : Infinity;
    
    if (!isFinite(minHits) || !isFinite(maxHits)) {
        return { hits: 0, percent: "0.0", randLevel: "不可", isSubstitute: isSubstitute, targetHP: targetHP };
    }
    
    // ★修正: 確定n発判定を追加
    if (minHits === maxHits) {
        return {
            hits: minHits,
            percent: null,
            randLevel: "確定",
            effectiveMinDamage: effectiveMinDamage,
            effectiveMaxDamage: effectiveMaxDamage,
            isSubstitute: isSubstitute,
            targetHP: targetHP
        };
    }
    
    // ここから乱数計算
    let knockoutPercent = 0;
    
    if (minHits === 1) {
        if (effectiveMaxDamage >= targetHP) {
            const successfulOutcomes = Math.max(0, effectiveMaxDamage - Math.max(effectiveMinDamage, targetHP) + 1);
            const totalOutcomes = effectiveMaxDamage - effectiveMinDamage + 1;
            knockoutPercent = (successfulOutcomes / totalOutcomes) * 100;
        } else {
            knockoutPercent = 0;
        }
    } else if (minHits === 2) {
        const totalOutcomes = Math.pow(effectiveMaxDamage - effectiveMinDamage + 1, 2);
        let successfulOutcomes = 0;
        
        for (let dmg1 = effectiveMinDamage; dmg1 <= effectiveMaxDamage; dmg1++) {
            const requiredDmg2 = targetHP - dmg1;
            
            if (requiredDmg2 <= 0) {
                successfulOutcomes += effectiveMaxDamage - effectiveMinDamage + 1;
            } else if (requiredDmg2 <= effectiveMaxDamage) {
                successfulOutcomes += Math.max(0, effectiveMaxDamage - Math.max(effectiveMinDamage, requiredDmg2) + 1);
            }
        }
        
        knockoutPercent = (successfulOutcomes / totalOutcomes) * 100;
    } else {
        // 3発以上の場合の近似計算
        const avgDamage = (effectiveMinDamage + effectiveMaxDamage) / 2;
        const totalDamageNeeded = targetHP;
        const minTotalDamage = effectiveMinDamage * minHits;
        const maxTotalDamage = effectiveMaxDamage * minHits;
        
        if (minTotalDamage >= totalDamageNeeded) {
            knockoutPercent = 95.0;
        } else if (maxTotalDamage < totalDamageNeeded) {
            knockoutPercent = 5.0;
        } else {
            const ratio = (maxTotalDamage - totalDamageNeeded) / (maxTotalDamage - minTotalDamage);
            knockoutPercent = 5.0 + ratio * 90.0;
        }
    }
    
    knockoutPercent = Math.round(knockoutPercent * 10) / 10;
    knockoutPercent = Math.max(0, Math.min(100, knockoutPercent));
    
    let randLevelText = "";
    
    if (knockoutPercent >= 93.75) {
        randLevelText = "超高乱数";
    } else if (knockoutPercent >= 75.0) {
        randLevelText = "高乱数";
    } else if (knockoutPercent >= 62.5) {
        randLevelText = "中高乱数";
    } else if (knockoutPercent >= 37.5) {
        randLevelText = "中乱数";
    } else if (knockoutPercent >= 25.0) {
        randLevelText = "中低乱数";
    } else if (knockoutPercent > 6.3) {
        randLevelText = "低乱数";
    } else if (knockoutPercent > 0) {
        randLevelText = "超低乱数";
    } else {
        const requiredHits = Math.ceil(targetHP / effectiveMinDamage);
        return {
            hits: requiredHits,
            percent: null,
            randLevel: "確定",
            effectiveMinDamage: effectiveMinDamage,
            effectiveMaxDamage: effectiveMaxDamage,
            isSubstitute: isSubstitute,
            targetHP: targetHP
        };
    }
    
    return {
        hits: minHits,
        percent: knockoutPercent === 100.0 ? null : knockoutPercent.toFixed(1),
        randLevel: randLevelText,
        effectiveMinDamage: effectiveMinDamage,
        effectiveMaxDamage: effectiveMaxDamage,
        isSubstitute: isSubstitute,
        targetHP: targetHP
    };
}

// 固定回数連続技の乱数計算(急所、命中考慮）
function calculateFixedMultiHitRandText(displayMinDamage, displayMaxDamage, targetHP, hitCount, isSubstitute) {
    console.log(`固定${hitCount}回攻撃の乱数計算: ダメージ${displayMinDamage}~${displayMaxDamage}, 対象HP${targetHP}`);
    
    const effectiveMinDamage = displayMinDamage;
    const effectiveMaxDamage = displayMaxDamage;
    
    // 確定1発判定
    if (effectiveMinDamage >= targetHP) {
        return {
            hits: 1,
            percent: null,
            randLevel: "確定",
            effectiveMinDamage: effectiveMinDamage,
            effectiveMaxDamage: effectiveMaxDamage,
            isSubstitute: isSubstitute,
            targetHP: targetHP,
            isFixedHit: true,
            hitCount: hitCount
        };
    }
    
    // 乱数1発判定
    if (effectiveMaxDamage >= targetHP) {
        // 各発の個別ダメージを逆算
        const singleMinDamage = Math.floor(effectiveMinDamage / hitCount);
        const singleMaxDamage = Math.ceil(effectiveMaxDamage / hitCount);
        
        // 命中・急所を考慮しない純粋な瀕死率計算
        const successRate = calculatePureFixedHitKORate(singleMinDamage, singleMaxDamage, hitCount, targetHP);
        
        let randLevel = "";
        if (successRate >= 93.75) {
            randLevel = "超高乱数";
        } else if (successRate >= 75.0) {
            randLevel = "高乱数";
        } else if (successRate >= 62.5) {
            randLevel = "中高乱数";
        } else if (successRate >= 37.5) {
            randLevel = "中乱数";
        } else if (successRate >= 25.0) {
            randLevel = "中低乱数";
        } else if (successRate > 6.3) {
            randLevel = "低乱数";
        } else {
            randLevel = "超低乱数";
        }
        
        return {
            hits: 1,
            percent: successRate.toFixed(1),
            randLevel: randLevel,
            effectiveMinDamage: effectiveMinDamage,
            effectiveMaxDamage: effectiveMaxDamage,
            isSubstitute: isSubstitute,
            targetHP: targetHP,
            isFixedHit: true,
            hitCount: hitCount
        };
    }
    
    // 確定n発の場合
    const requiredHits = Math.ceil(targetHP / effectiveMinDamage);
    return {
        hits: requiredHits,
        percent: null,
        randLevel: "確定",
        effectiveMinDamage: effectiveMinDamage,
        effectiveMaxDamage: effectiveMaxDamage,
        isSubstitute: isSubstitute,
        targetHP: targetHP,
        isFixedHit: true,
        hitCount: hitCount
    };
}

// 命中・急所を考慮しない純粋な固定回数瀕死率計算
function calculatePureFixedHitKORate(singleMinDamage, singleMaxDamage, hitCount, targetHP) {
    const totalMinDamage = singleMinDamage * hitCount;
    const totalMaxDamage = singleMaxDamage * hitCount;
    
    // 確定の場合
    if (totalMinDamage >= targetHP) {
        return 100.0;
    }
    
    // 不可能の場合
    if (totalMaxDamage < targetHP) {
        return 0.0;
    }
    
    // ダメージパターン数
    const damagePatterns = singleMaxDamage - singleMinDamage + 1;
    
    // 小さい範囲の場合は全パターン計算
    if (damagePatterns <= 10 && hitCount <= 5) {
        let koPatterns = 0;
        const totalPatterns = Math.pow(damagePatterns, hitCount);
        
        for (let pattern = 0; pattern < totalPatterns; pattern++) {
            let totalDamage = 0;
            let temp = pattern;
            
            for (let hit = 0; hit < hitCount; hit++) {
                const damageIndex = temp % damagePatterns;
                totalDamage += singleMinDamage + damageIndex;
                temp = Math.floor(temp / damagePatterns);
            }
            
            if (totalDamage >= targetHP) {
                koPatterns++;
            }
        }
        
        return (koPatterns / totalPatterns) * 100;
    } else {
        // 大きい範囲の場合は正規分布近似
        const mean = (singleMinDamage + singleMaxDamage) / 2 * hitCount;
        const variance = Math.pow(singleMaxDamage - singleMinDamage, 2) / 12 * hitCount;
        const stdDev = Math.sqrt(variance);
        
        if (stdDev === 0) {
            return mean >= targetHP ? 100.0 : 0.0;
        }
        
        // 正規分布のCDFを近似
        const z = (targetHP - 0.5 - mean) / stdDev;
        const probability = 1 - normalCDF(z);
        
        return Math.max(0, Math.min(100, probability * 100));
    }
}
// 正規分布の累積分布関数（近似）
function normalCDF(x) {
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;
    
    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);
    
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    
    return 0.5 * (1.0 + sign * y);
}
// ========================================
// 統合版連続技計算システム
// ========================================

/**
 * 連続技の統合計算クラス（メンテナンス性向上）
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
        
        this.criticalRate = 1/16;  // 急所率（固定）
        this.normalRate = 15/16;   // 通常攻撃率（固定）
    }
    
    /**
     * 連続技の瀕死率を計算（メイン関数）
     * @param {number} singleMinDamage - 1発の最小ダメージ
     * @param {number} singleMaxDamage - 1発の最大ダメージ
     * @param {number} targetHP - 対象HP
     * @param {Object} move - 技データ
     * @returns {Object} 計算結果
     */
    calculateMultiHitKORate(singleMinDamage, singleMaxDamage, targetHP, move) {
        console.log(`=== 連続技統合計算開始: ${move.name} ===`);
        console.log(`1発ダメージ: ${singleMinDamage}~${singleMaxDamage}, 対象HP: ${targetHP}`);
        
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
     * @param {Object} move - 技データ
     * @returns {number} 最終命中率（0-1）
     */
    calculateAccuracy(move) {
        // 天候の取得
        const weather = document.getElementById('weatherSelect').value;
        
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
     * @param {number} singleMinDamage - 1発の最小ダメージ
     * @param {number} singleMaxDamage - 1発の最大ダメージ
     * @param {number} hitCount - 攻撃回数
     * @param {number} targetHP - 対象HP
     * @returns {number} 瀕死確率（0-1）
     */
    calculateKOForSpecificHits(singleMinDamage, singleMaxDamage, hitCount, targetHP) {
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
        
        return states.get(0) || 0;
    }
    
    /**
     * 通常ダメージの処理
     */
    processNormalDamage(hp, prob, singleMinDamage, singleMaxDamage, newStates) {
        const normalPatterns = singleMaxDamage - singleMinDamage + 1;
        
        for (let i = 0; i < normalPatterns; i++) {
            const damage = singleMinDamage + i;
            const newHP = Math.max(0, hp - damage);
            const patternProb = prob * this.normalRate / normalPatterns;
            
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
        
        for (let i = 0; i < critPatterns; i++) {
            const damage = critMinDamage + i;
            const newHP = Math.max(0, hp - damage);
            const patternProb = prob * this.criticalRate / critPatterns;
            
            newStates.set(newHP, (newStates.get(newHP) || 0) + patternProb);
        }
    }
    
    /**
     * 表示用のダメージ範囲を計算
     * @param {number} singleMinDamage - 1発の最小ダメージ
     * @param {number} singleMaxDamage - 1発の最大ダメージ
     * @param {number} constantDamage - 定数ダメージ
     * @returns {Object} 表示用ダメージ範囲
     */
    getDisplayDamageRange(singleMinDamage, singleMaxDamage, constantDamage = 0) {
        return {
            min: singleMinDamage * 2 + constantDamage,  // 最小2回
            max: singleMaxDamage * 5 + constantDamage,  // 最大5回
            text: `${singleMinDamage * 2 + constantDamage}~${singleMaxDamage * 5 + constantDamage}`
        };
    }
}

// ========================================
// 統合後の関数（既存システムとの互換性維持）
// ========================================

// グローバルインスタンス
const multiHitCalculator = new MultiHitCalculator();

/**
 * 統合版: 連続技の乱数計算（既存関数を置き換え）
 */
function calculateMultiHitRandTextUnified(singleMinDamage, singleMaxDamage, targetHP, isSubstitute) {
    try {
        // 定数ダメージを加算
        const constantDamage = calculateTotalConstantDamage(defenderPokemon.baseStats?.hp || targetHP, defenderPokemon.types, 1);
        const effectiveTargetHP = targetHP + constantDamage;
        
        // 統合計算を実行
        const result = multiHitCalculator.calculateMultiHitKORate(
            singleMinDamage, 
            singleMaxDamage, 
            effectiveTargetHP, 
            currentMove
        );
        
        // 表示用ダメージ範囲を取得
        const displayRange = multiHitCalculator.getDisplayDamageRange(singleMinDamage, singleMaxDamage, constantDamage);
        
        // 既存形式の戻り値に変換
        const koRate = result.koRatePercent;
        
        let randLevel = "";
        if (koRate >= 99.5) {
            randLevel = "確定";
        } else if (koRate >= 93.75) {
            randLevel = "超高乱数";
        } else if (koRate >= 75.0) {
            randLevel = "高乱数";
        } else if (koRate >= 62.5) {
            randLevel = "中高乱数";
        } else if (koRate >= 37.5) {
            randLevel = "中乱数";
        } else if (koRate >= 25.0) {
            randLevel = "中低乱数";
        } else if (koRate > 6.3) {
            randLevel = "低乱数";
        } else {
            randLevel = "超低乱数";
        }
        
        return {
            hits: 1,
            percent: koRate >= 99.5 ? null : koRate.toFixed(1),
            randLevel: randLevel,
            effectiveMinDamage: displayRange.min,
            effectiveMaxDamage: displayRange.max,
            isSubstitute: isSubstitute,
            targetHP: targetHP,
            isMultiHit: true,
            hitCount: "2-5"
        };
        
    } catch (error) {
        console.error('統合版連続技計算でエラー:', error);
        
        // フォールバック計算
        const constantDamage = calculateTotalConstantDamage(defenderPokemon.baseStats?.hp || targetHP, defenderPokemon.types, 1);
        const effectiveMinDamage = singleMinDamage * 2 + constantDamage; // 最小2回
        const effectiveMaxDamage = singleMaxDamage * 5 + constantDamage; // 最大5回
        
        return {
            hits: 1,
            percent: "0.0",
            randLevel: "計算エラー",
            effectiveMinDamage: effectiveMinDamage,
            effectiveMaxDamage: effectiveMaxDamage,
            isSubstitute: isSubstitute,
            targetHP: targetHP,
            isMultiHit: true,
            hitCount: "2-5"
        };
    }
}


// 連続技の瀕死確率計算（発生確率を考慮）
function calculateMultiHitKOProbabilityWithDistribution(singleMinDamage, singleMaxDamage, effectiveTargetHP) {
    // 連続技の回数と発生確率
    const hitDistribution = [
        { hits: 2, probability: 3/8 },  // 37.5%
        { hits: 3, probability: 3/8 },  // 37.5%
        { hits: 4, probability: 1/8 },  // 12.5%
        { hits: 5, probability: 1/8 }   // 12.5%
    ];
    
    // 技の命中率を取得
    const baseAccuracy = (currentMove.accuracy || 100) / 100;
    
    // はりきりの効果（物理技の命中率0.8倍）
    let finalAccuracy = baseAccuracy;
    if (document.getElementById('harikiriCheck')?.checked && currentMove.category === 'Physical') {
        finalAccuracy *= 0.8;
    }
    
    // ひかりのこなの効果（防御側アイテム）
    if (defenderPokemon.item && defenderPokemon.item.name === 'ひかりのこな') {
        finalAccuracy *= 0.9;
    }
    
    // 回避ランクの適用
    const evasionRank = parseInt(document.getElementById('defenderEvasionRank')?.value) || 0;
    if (evasionRank !== 0) {
        const evasionMultiplier = getAccuracyMultiplier(-evasionRank);
        finalAccuracy = Math.min(1, finalAccuracy * evasionMultiplier);
    }
    
    console.log(`連続技詳細計算: 1発${singleMinDamage}~${singleMaxDamage}, 対象HP${effectiveTargetHP}, 命中率${(finalAccuracy*100).toFixed(1)}%`);
    
    let totalKOProbability = 0;
    
    // 各回数での瀕死確率を計算
    for (const { hits, probability } of hitDistribution) {
        const koRateForHits = calculateKOProbabilityForExactHits(
            singleMinDamage, 
            singleMaxDamage, 
            hits, 
            effectiveTargetHP,
            finalAccuracy
        );
        
        const weightedKORate = koRateForHits * probability;
        totalKOProbability += weightedKORate;
        
        console.log(`${hits}回攻撃: 瀕死率${(koRateForHits * 100).toFixed(2)}% × 発生率${(probability * 100).toFixed(1)}% = ${(weightedKORate * 100).toFixed(3)}%`);
    }
    
    console.log(`総合瀕死率: ${(totalKOProbability * 100).toFixed(3)}%`);
    
    return totalKOProbability * 100;
}

// 特定回数での瀕死確率計算
function calculateKOProbabilityForExactHits(singleMinDamage, singleMaxDamage, hitCount, targetHP, accuracy) {
    // 急所率
    const criticalRate = 1/16;
    const normalRate = 15/16;
    
    // 急所時のダメージ
    const critMinDamage = singleMinDamage * 2;
    const critMaxDamage = singleMaxDamage * 2;
    
    // ダメージパターン数
    const normalPatterns = singleMaxDamage - singleMinDamage + 1;
    const critPatterns = critMaxDamage - critMinDamage + 1;
    
    // 動的プログラミングでHP状態の確率を計算
    let currentStates = { [targetHP]: 1.0 };
    
    for (let hit = 0; hit < hitCount; hit++) {
        const nextStates = {};
        
        for (const [hpStr, prob] of Object.entries(currentStates)) {
            const hp = parseInt(hpStr);
            if (hp <= 0 || prob <= 0) continue;
            
            // 技が外れた場合
            const missProb = prob * (1 - accuracy);
            if (missProb > 0) {
                if (!nextStates[hp]) nextStates[hp] = 0;
                nextStates[hp] += missProb;
            }
            
            // 技が命中した場合
            const hitProb = prob * accuracy;
            if (hitProb > 0) {
                // 通常ダメージ
                for (let i = 0; i < normalPatterns; i++) {
                    const damage = singleMinDamage + i;
                    const newHP = Math.max(0, hp - damage);
                    const patternProb = hitProb * normalRate * (1 / normalPatterns);
                    
                    if (!nextStates[newHP]) nextStates[newHP] = 0;
                    nextStates[newHP] += patternProb;
                }
                
                // 急所ダメージ
                for (let i = 0; i < critPatterns; i++) {
                    const damage = critMinDamage + i;
                    const newHP = Math.max(0, hp - damage);
                    const patternProb = hitProb * criticalRate * (1 / critPatterns);
                    
                    if (!nextStates[newHP]) nextStates[newHP] = 0;
                    nextStates[newHP] += patternProb;
                }
            }
        }
        
        currentStates = nextStates;
    }
    
    // HP0の確率を返す
    return currentStates[0] || 0;
}

// 統合乱数計算関数（直接判定版）
function calculateRandTextIntegrated(minDamage, maxDamage, defenderHP) {
    // みがわり仮定かチェック
    const isSubstitute = document.getElementById('substituteCheck')?.checked || false;
    let targetHP = defenderHP;
    
    if (isSubstitute) {
        targetHP = Math.floor(defenderHP / 4);
    } else {
        const currentHPInput = document.getElementById('defenderCurrentHP');
        if (currentHPInput && currentHPInput.value) {
            targetHP = parseInt(currentHPInput.value) || defenderHP;
        }
    }
    
    // 技のクラスで直接判定
    if (currentMove) {
        if (currentMove.class === 'two_hit') {
            return calculateTwoHitRandText(minDamage, maxDamage, targetHP, isSubstitute);
        } else if (currentMove.class === 'multi_hit') {
            // ★安全版統合関数を使用
            try {
                return calculateMultiHitRandTextUnified(minDamage, maxDamage, targetHP, isSubstitute);
            } catch (error) {
                console.error('統合版連続技計算でエラー:', error);
                // フォールバック: 基本的な戻り値を返す
                const constantDamage = calculateTotalConstantDamage(defenderPokemon.baseStats?.hp || targetHP, defenderPokemon.types, 1);
                const effectiveMinDamage = minDamage * 2 + constantDamage; // 最小2回
                const effectiveMaxDamage = maxDamage * 5 + constantDamage; // 最大5回
                
                return {
                    hits: 1,
                    percent: "0.0",
                    randLevel: "計算エラー",
                    effectiveMinDamage: effectiveMinDamage,
                    effectiveMaxDamage: effectiveMaxDamage,
                    isSubstitute: isSubstitute,
                    targetHP: targetHP,
                    isMultiHit: true,
                    hitCount: "2-5"
                };
            }
        }
    }
    
    // 通常技の場合は既存の処理
    return calculateRandText(minDamage, maxDamage, defenderHP);
}

// 新しい連続技乱数計算関数
function performDamageCalculationEnhanced() {
    // ツール情報非表示
    document.querySelector('.tool-info').style.display = 'none';
    // ポワルンのタイプを最新の天候に更新
    updateCastformTypeIfNeeded();

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
    
    // 定数ダメージの設定があるかチェック
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
        console.log('定数ダメージがあるため内部的に複数ターン計算（表示は単発）');
        
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
        
        // ★修正: 1発分のダメージを計算
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
        
        // ★重要: 連続技でも1発分のダメージをそのまま渡す
        const minDamage = baseDamageMin;
        const maxDamage = baseDamageMax;
        
        console.log(`単発技（定数ダメージあり）: ${minDamage}~${maxDamage}`);
        
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
    
    // ★修正: 1発分のダメージを計算
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
    
    // 連続技でも1発分のダメージをそのまま渡す
    const minDamage = baseDamageMin;
    const maxDamage = baseDamageMax;
    
    // 統合版結果表示を呼び出し
    displayUnifiedResults(minDamage, maxDamage, defenderStats.hp, false, atkRank, defRank);
}

// ダメージ計算での連続攻撃対応（統合版）
function calculateDamageIntegrated(attack, defense, level, power, category, moveType, attackerTypes, defenderTypes, atkRank, defRank) {
    // 1発分の基本ダメージを計算
    const [baseDamageMin, baseDamageMax] = calculateDamage(attack, defense, level, power, category, moveType, attackerTypes, defenderTypes, atkRank, defRank);
    
    // 連続攻撃技の場合はダメージを調整
    if (currentMove) {
        if (currentMove.class === 'two_hit') {
            // 2回攻撃: 固定2倍
            console.log('2回攻撃技のダメージ計算: 2倍');
            return [Math.max(1, baseDamageMin * 2), baseDamageMax * 2];
        } else if (currentMove.class === 'multi_hit') {
            // 可変回数攻撃: 1発分のダメージをそのまま返す（乱数計算で発生確率を考慮）
            console.log(`可変回数攻撃技のダメージ計算: 1発分 ${baseDamageMin}~${baseDamageMax}`);
            return [baseDamageMin, baseDamageMax]; // ★修正: 1発分のダメージを返す
        }
    }
    
    // 通常技
    return [baseDamageMin, baseDamageMax];
}

// HPバー作成
function createHPBar(minDamage, maxDamage, totalHP, keepDamage = false) {
    const maxDots = 48;
    
    // みがわり仮定かチェック
    const isSubstitute = document.getElementById('substituteCheck')?.checked || false;
    let currentHP = totalHP;
    let displayMaxHP = totalHP;
    
    if (isSubstitute) {
        // みがわりの場合
        currentHP = Math.floor(totalHP / 4);
        displayMaxHP = currentHP; // HPバーの基準もみがわりHPに
    } else {
        // 現在HPを取得
        const currentHPInput = document.getElementById('defenderCurrentHP');
        if (currentHPInput && currentHPInput.value) {
            currentHP = parseInt(currentHPInput.value) || totalHP;
        }
        displayMaxHP = currentHP; // HPバーの基準を現在HPに変更
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
    const constantDamage = calculateTotalConstantDamage(totalHP, defenderPokemon.types, 1);
    
    // ダメージに定数ダメージを追加
    displayMinDamage += constantDamage;
    displayMaxDamage += constantDamage;
    
    // アイテム効果を考慮
    const defenderItem = defenderPokemon.item;
    let healInfo = '';
    let effectiveMinDamage = displayMinDamage;
    let effectiveMaxDamage = displayMaxDamage;
    
    if (defenderItem && !isSubstitute) { // みがわりの場合はアイテム効果なし
        if (defenderItem.name === 'オボンのみ') {
            // HP50%以下で30回復
            const halfHP = totalHP / 2;
            if (totalHP - effectiveMinDamage <= halfHP) {
                healInfo = ' (オボンのみ発動後)';
                effectiveMinDamage = Math.max(0, effectiveMinDamage - 30);
                effectiveMaxDamage = Math.max(0, effectiveMaxDamage - 30);
            }
        } else if (isFigyBerry(defenderItem.name)) {
            // HP50%以下で最大HPの1/8回復
            const halfHP = totalHP / 2;
            const healAmount = Math.floor(totalHP / 8);
            if (totalHP - effectiveMinDamage <= halfHP) {
                healInfo = ` (${defenderItem.name}発動後)`;
                effectiveMinDamage = Math.max(0, effectiveMinDamage - healAmount);
                effectiveMaxDamage = Math.max(0, effectiveMaxDamage - healAmount);
            }
        } else if (defenderItem.name === 'たべのこし') {
            // 毎ターン1/16回復
            const healAmount = Math.floor(totalHP / 16);
            healInfo = ' (たべのこし考慮)';
            effectiveMinDamage = Math.max(0, effectiveMinDamage - healAmount);
            effectiveMaxDamage = Math.max(0, effectiveMaxDamage - healAmount);
        }
    }
    
    // 定数ダメージの詳細情報を生成
    let constantDamageInfo = '';
    if (constantDamage > 0) {
        const damageDetails = [];
        
        // 状態異常ダメージ
        const statusType = document.getElementById('statusDamageSelect').value;
        if (statusType !== 'none') {
            const statusNames = {
                'burn': 'やけど',
                'poison': 'どく', 
                'badlypoison': 'もうどく'
            };
            const statusDamage = calculateStatusDamage(totalHP, statusType, 1);
            if (statusDamage > 0) {
                damageDetails.push(`${statusNames[statusType]} -${statusDamage}`);
            }
        }
        
        // まきびしダメージ
        const spikesLevel = parseInt(document.getElementById('spikesLevel').value) || 0;
        const spikesDamage = calculateSpikesDamage(totalHP, spikesLevel, 1);
        if (spikesDamage > 0) {
            damageDetails.push(`まきびし -${spikesDamage}`);
        }
        
        // のろいダメージ
        const curseSelect = document.getElementById('curseSelect');
        if (curseSelect && curseSelect.value !== 'none') {
            const curseDamage = calculateCurseDamage(totalHP);
            damageDetails.push(`のろい -${curseDamage}`);
        }
        
        // あくむダメージ
        const nightmareSelect = document.getElementById('nightmareSelect');
        if (nightmareSelect && nightmareSelect.value !== 'none') {
            const nightmareDamage = calculateNightmareDamage(totalHP);
            damageDetails.push(`あくむ -${nightmareDamage}`);
        }
        
        // やどりぎダメージ
        const leechSeedSelect = document.getElementById('leechSeedSelect');
        if (leechSeedSelect && leechSeedSelect.value !== 'none') {
            const leechSeedDamage = calculateLeechSeedDamage(totalHP);
            damageDetails.push(`やどりぎ -${leechSeedDamage}`);
        }
        
        // 天候ダメージ
        const weather = document.getElementById('weatherSelect').value;
        const weatherDamage = calculateWeatherDamage(totalHP, defenderPokemon.types, weather);
        if (weatherDamage > 0) {
            const weatherNames = {
                'sandstorm': 'すなあらし',
                'hail': 'あられ'
            };
            damageDetails.push(`${weatherNames[weather]} -${weatherDamage}`);
        }
        
        if (damageDetails.length > 0) {
            constantDamageInfo = `<br>(${damageDetails.join(', ')})`;
        }
    }
    
    const remainHPAfterMinDamage = Math.max(0, currentHP - effectiveMinDamage);
    const remainHPAfterMaxDamage = Math.max(0, currentHP - effectiveMaxDamage);
    
    const remainMinDots = Math.ceil((remainHPAfterMinDamage / displayMaxHP) * maxDots);
    const remainMaxDots = Math.ceil((remainHPAfterMaxDamage / displayMaxHP) * maxDots);
    
    const remainMinPercent = (remainHPAfterMinDamage / displayMaxHP * 100).toFixed(1);
    const remainMaxPercent = (remainHPAfterMaxDamage / displayMaxHP * 100).toFixed(1);
    
    const dotPercentage = 100 / maxDots;
    const minDotPercent = remainMinDots * dotPercentage;
    const maxDotPercent = remainMaxDots * dotPercentage;
    
    function generateLayers() {
        let layers = '';
        
        if (remainMinDots >= 25 && remainMaxDots < 25) {
            layers += `<div style="height: 100%; width: ${maxDotPercent}%; background-color: #f8e038 !important; position: absolute; left: 0; top: 0; z-index: 10;"></div>`;
            const halfDotPercent = 24 * dotPercentage;
            layers += `<div style="height: 100%; width: ${halfDotPercent}%; background-color: #c8a808 !important; position: absolute; left: 0; top: 0; z-index: 9;"></div>`;
            layers += `<div style="height: 100%; width: ${minDotPercent}%; background-color: #58d080 !important; position: absolute; left: 0; top: 0; z-index: 8;"></div>`;
        } else if (remainMinDots >= 25 && remainMaxDots >= 25) {
            layers += `<div style="height: 100%; width: ${maxDotPercent}%; background-color: #70f8a8 !important; position: absolute; left: 0; top: 0; z-index: 10;"></div>`;
            layers += `<div style="height: 100%; width: ${minDotPercent}%; background-color: #58d080 !important; position: absolute; left: 0; top: 0; z-index: 8;"></div>`;
        } else if (remainMinDots >= 10 && remainMaxDots < 10) {
            layers += `<div style="height: 100%; width: ${maxDotPercent}%; background-color: #f85838 !important; position: absolute; left: 0; top: 0; z-index: 10;"></div>`;
            const fifthDotPercent = 9 * dotPercentage;
            layers += `<div style="height: 100%; width: ${fifthDotPercent}%; background-color: #a84048 !important; position: absolute; left: 0; top: 0; z-index: 9;"></div>`;
            layers += `<div style="height: 100%; width: ${minDotPercent}%; background-color: #c8a808 !important; position: absolute; left: 0; top: 0; z-index: 8;"></div>`;
        } else if (remainMinDots >= 10 && remainMinDots < 25 && remainMaxDots >= 10 && remainMaxDots < 25) {
            layers += `<div style="height: 100%; width: ${maxDotPercent}%; background-color: #f8e038 !important; position: absolute; left: 0; top: 0; z-index: 10;"></div>`;
            layers += `<div style="height: 100%; width: ${minDotPercent}%; background-color: #c8a808 !important; position: absolute; left: 0; top: 0; z-index: 8;"></div>`;
        } else if (remainMinDots < 10 && remainMaxDots < 10) {
            layers += `<div style="height: 100%; width: ${maxDotPercent}%; background-color: #f85838 !important; position: absolute; left: 0; top: 0; z-index: 10;"></div>`;
            layers += `<div style="height: 100%; width: ${minDotPercent}%; background-color: #a84048 !important; position: absolute; left: 0; top: 0; z-index: 8;"></div>`;
        }
        
        return layers;
    }
    
    function generateDotMarkers() {
        let markers = '';
        const dotWidth = 100 / maxDots;
        
        for (let i = 1; i < maxDots; i++) {
            const position = i * dotWidth;
            markers += `<div style="height: 100%; width: 1px; background-color: rgba(0,0,0,0.2); position: absolute; left: ${position}%; top: 0; z-index: 20;"></div>`;
        }
        
        return markers;
    }
    
    let hpBarHtml = '';
    
    if (remainHPAfterMaxDamage == remainHPAfterMinDamage) {
        // HPバー表示文言の生成
        let hpDisplayText = '';
        if (isSubstitute) {
            hpDisplayText = `みがわりHP: ${remainHPAfterMaxDamage}/${displayMaxHP} (${remainMaxPercent}%)${healInfo}${constantDamageInfo}`;
        } else {
            if (currentHP === totalHP) {
                hpDisplayText = `HP: ${remainHPAfterMaxDamage}/${currentHP} (${remainMaxPercent}%)${healInfo}${constantDamageInfo}`;
            } else {
                hpDisplayText = `HP: ${remainHPAfterMaxDamage}/${currentHP} (現在HPから${remainMaxPercent}%)${healInfo}${constantDamageInfo}`;
            }
        }
        
        hpBarHtml = `
        <div style="margin: 10px 0; width: 100%; position: relative;">
          <div style="height: 15px; width: 100%; background-color: #506858; border-radius: 5px; position: relative; overflow: hidden;">
            ${generateLayers()}
            ${generateDotMarkers()}
          </div>
          <div style="text-align: center; margin-top: 3px; font-size: 0.85em; color: #777;">
            <div>${hpDisplayText}</div>
            <div>ドット: [${remainMaxDots}/48]</div>
          </div>
        </div>
        `;
    } else {
        // HPバー表示文言の生成
        let hpDisplayText = '';
        if (isSubstitute) {
            hpDisplayText = `みがわりHP: ${remainHPAfterMaxDamage}~${remainHPAfterMinDamage}/${displayMaxHP} (${remainMaxPercent}%~${remainMinPercent}%)${healInfo}${constantDamageInfo}`;
        } else {
            if (currentHP === totalHP) {
                hpDisplayText = `HP: ${remainHPAfterMaxDamage}~${remainHPAfterMinDamage}/${currentHP} (${remainMaxPercent}%~${remainMinPercent}%)${healInfo}${constantDamageInfo}`;
            } else {
                hpDisplayText = `HP: ${remainHPAfterMaxDamage}~${remainHPAfterMinDamage}/${currentHP} (現在HPから${remainMaxPercent}%~${remainMinPercent}%)${healInfo}${constantDamageInfo}`;
            }
        }
        
        hpBarHtml = `
        <div style="margin: 10px 0; width: 100%; position: relative;">
          <div style="height: 15px; width: 100%; background-color: #506858; border-radius: 5px; position: relative; overflow: hidden;">
            ${generateLayers()}
            ${generateDotMarkers()}
          </div>
          <div style="text-align: center; margin-top: 3px; font-size: 0.85em; color: #777;">
            <div>${hpDisplayText}</div>
            <div>ドット: [${remainMaxDots}~${remainMinDots}/48]</div>
          </div>
        </div>
        `;
    }
    
    return hpBarHtml;
}


// ========================
// 8. 複数ターン技設定の管理
// ========================

// 技を追加する新しい関数
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

// 複数ターン技設定をクリア
function clearMultiTurnMoves() {
    console.log('clearMultiTurnMoves called');
    
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
    
    console.log('複数ターン技設定をクリアしました');
}

// 複数ターン技の選択
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
        const spikesLevel = parseInt(document.getElementById('spikesLevel').value) || 0;
        const weather = document.getElementById('weatherSelect').value;
        
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
        } else {
            console.log('自動設定が有効のため、配列内の技は無視します');
        }
    }
    
    const result = hasActualMultiTurnMoves;
    
    return result;
}




// ========================
// 9. 瀕死率計算機能の追加
// ========================

// 瀕死率計算のメイン関数（複数ターン対応）
function calculateMultiTurnKORate(defenderHP, turns = 4) {
    // 防御側アイテムの確認
    const defenderItem = defenderPokemon.item;
    
    const hasItem = defenderItem && (
        defenderItem.name === 'たべのこし' || 
        defenderItem.name === 'オボンのみ' ||
        defenderItem.name === 'くろいヘドロ' ||
        isFigyBerry(defenderItem.name)
    );
    
    try {
        console.log('=== calculateMultiTurnKORate開始（統合版） ===');
        console.log('防御側アイテム:', defenderItem ? defenderItem.name : 'なし');
        
        // ★統合版を使用した基本瀕死率計算
        const basicResult = calculateMultiTurnBasicKORateUnified(defenderHP, turns);
        
        // アイテム効果ありの瀕死率と残HP情報
        let itemResult = null;
        if (hasItem) {          
            try {
                itemResult = calculateMultiTurnKORateWithItems(defenderHP, turns);
            } catch (itemError) {
                console.error('アイテム効果計算でエラー:', itemError);
                console.error('アイテムエラースタック:', itemError.stack);
            }
        }

        const result = {
            basic: basicResult.rates,
            withItems: itemResult ? itemResult.rates : null,
            hpInfo: itemResult ? itemResult.hpInfo : null,
            basis: basicResult.basis,
            hpRanges: basicResult.hpRanges
        };
        
        console.log('=== calculateMultiTurnKORate完了（統合版） ===');
        return result;
        
    } catch (error) {
        console.error('=== calculateMultiTurnKORate内でエラー発生 ===');
        console.error('エラーメッセージ:', error.message);
        console.error('エラータイプ:', error.name);
        console.error('エラースタック:', error.stack);
        console.error('エラー発生時の状態:', {
            defenderHP,
            turns,
            hasItem,
            multiTurnMovesLength: multiTurnMoves.length,
            currentMoveName: currentMove?.name
        });
        
        // エラーを再スローして上位で処理
        throw error;
    }
}

// 複数ターン基本瀕死率計算
function calculateMultiTurnBasicKORateUnified(defenderHP, maxTurns) {
    const results = Array(maxTurns).fill(0);
    const calculationBasis = Array(maxTurns).fill(null);
    const remainingHPRanges = Array(maxTurns).fill(null);
    
    console.log('=== 統合版基本瀕死率計算開始 ===');
    
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
    
    // 表示用の計算根拠を準備
    for (let turn = 0; turn < maxTurns; turn++) {
        if (moveDataList[turn]) {
            const move = turn === 0 ? currentMove : multiTurnMoves[turn];
            
            // 状態異常の影響を記録
            let statusEffects = [];
            
            const paralysisSelect = document.getElementById('paralysisSelect');
            const paralysisStartTurn = paralysisSelect ? parseInt(paralysisSelect.value) : null;
            if (paralysisStartTurn && paralysisStartTurn !== 'none' && !isNaN(paralysisStartTurn) && turn + 1 >= paralysisStartTurn) {
                statusEffects.push('まひ（行動確率3/4）');
            }
            
            const confusionSelect = document.getElementById('confusionSelect');
            const confusionStartTurn = confusionSelect ? parseInt(confusionSelect.value) : null;
            if (confusionStartTurn && confusionStartTurn !== 'none' && !isNaN(confusionStartTurn) && turn + 1 >= confusionStartTurn) {
                statusEffects.push('こんらん（行動確率1/2）');
            }
            
            if (defenderPokemon.item && defenderPokemon.item.name === 'ひかりのこな') {
                statusEffects.push('ひかりのこな（命中率0.9倍）');
            }
            
            // 表示用ダメージ範囲を設定
            let displayDamageRange;
            if (move.class === 'multi_hit') {
                // 連続技の場合は統合版を使用
                const singleMin = moveDataList[turn].minDamage;
                const singleMax = moveDataList[turn].maxDamage;
                const constantDamage = calculateTotalConstantDamage(defenderHP, defenderPokemon.types, turn + 1);
                const displayRange = multiHitCalculator.getDisplayDamageRange(singleMin, singleMax, constantDamage);
                displayDamageRange = displayRange.text;
            } else {
                // 通常技の場合
                const constantDamage = calculateTotalConstantDamage(defenderHP, defenderPokemon.types, turn + 1);
                const minWithConstant = moveDataList[turn].minDamage + constantDamage;
                const maxWithConstant = moveDataList[turn].maxDamage + constantDamage;
                displayDamageRange = `${minWithConstant}~${maxWithConstant}`;
            }
            
            calculationBasis[turn] = {
                moveName: move.name,
                accuracy: move.accuracy || 100,
                damageRange: displayDamageRange,
                statusEffects: statusEffects,
                isMultiHit: move.class === 'multi_hit'
            };
        }
    }

    // ★修正: 連続技があるかどうかを一度だけチェックし、適切な計算方法を選択
    let hasAnyMultiHit = false;
    const multiHitTurns = new Set(); // 連続技があるターンを記録
    
    // 連続技があるターンを特定
    for (let turn = 0; turn < maxTurns; turn++) {
        const move = turn === 0 ? currentMove : multiTurnMoves[turn];
        if (move && move.class === 'multi_hit') {
            hasAnyMultiHit = true;
            multiHitTurns.add(turn);
        }
    }
    
    if (hasAnyMultiHit) {
        console.log('=== 連続技混在: 統合計算開始 ===');
        console.log('連続技があるターン:', Array.from(multiHitTurns).map(t => t + 1));
        
        // 統合された混合計算を実行（個別の連続技処理はここでは行わない）
        calculateMixedKORateProbability(defenderHP, moveDataList, 0, 0, 1.0, results);
        
        console.log('=== 連続技混在: 統合計算完了 ===');
    } else {
        console.log('=== 通常技のみ: 既存計算開始 ===');
        calculateKORateProbability(defenderHP, moveDataList, 0, 0, 1.0, results);
        console.log('=== 通常技のみ: 既存計算完了 ===');
    }
    
    console.log('統合版最終瀕死率:', results.map((rate, i) => `${i+1}T: ${(rate * 100).toFixed(3)}%`));
    console.log('=== 統合版基本瀕死率計算完了 ===');
    
    return {
        rates: results.map(rate => rate * 100),
        basis: calculationBasis,
        hpRanges: remainingHPRanges
    };
}

// 連続技と通常技が混在する場合の計算関数
function calculateMixedKORateProbability(remainingHP, moveDataList, turnIndex, totalDamage, currentProbability, results) {
    // HPが0以下になった場合
    if (remainingHP <= 0) {
        // 現在のターン以降すべてに確率を加算
        for (let i = turnIndex; i < results.length; i++) {
            results[i] += currentProbability;
        }
        return;
    }
    
    // すべてのターンを処理した場合
    if (turnIndex >= moveDataList.length) {
        return;
    }
    
    const moveData = moveDataList[turnIndex];
    if (!moveData) {
        // 技が設定されていない場合は次のターンへ
        calculateMixedKORateProbability(remainingHP, moveDataList, turnIndex + 1, totalDamage, currentProbability, results);
        return;
    }
    
    // 各ターンで技の種類を判定
    const move = turnIndex === 0 ? currentMove : multiTurnMoves[turnIndex];
    
    if (move && move.class === 'multi_hit') {
        // 連続技の場合は統合版計算を使用
        console.log(`${turnIndex + 1}ターン目: 連続技処理開始`);
        
        // 1発分のダメージを取得
        const singleMin = moveData.minDamage;
        const singleMax = moveData.maxDamage;
        const constantDamage = calculateTotalConstantDamage(remainingHP, defenderPokemon.types, turnIndex + 1);
        const effectiveTargetHP = remainingHP + constantDamage;
        
        try {
            const result = multiHitCalculator.calculateMultiHitKORate(singleMin, singleMax, effectiveTargetHP, move);
            const koRate = result.koRatePercent / 100;
            
            // この技で倒せる確率を加算
            const koThisTurn = currentProbability * koRate;
            for (let i = turnIndex; i < results.length; i++) {
                results[i] += koThisTurn;
            }
            
            // 生存して次のターンに進む確率
            const surviveRate = 1 - koRate;
            if (surviveRate > 0.001) { // 極小確率はスキップ
                // 連続技で生存した場合の残HPを簡略計算
                // 正確には複雑だが、平均的なダメージで近似
                const avgSingleDamage = (singleMin + singleMax) / 2;
                const avgTotalDamage = avgSingleDamage * 3; // 平均3回として近似
                const estimatedRemainingHP = Math.max(1, remainingHP - avgTotalDamage - constantDamage);
                
                calculateMixedKORateProbability(
                    estimatedRemainingHP,
                    moveDataList,
                    turnIndex + 1,
                    totalDamage + avgTotalDamage,
                    currentProbability * surviveRate,
                    results
                );
            }
            
            console.log(`${turnIndex + 1}ターン目連続技: KO率${(koRate * 100).toFixed(3)}%, 生存率${(surviveRate * 100).toFixed(3)}%`);
            
        } catch (error) {
            console.error(`${turnIndex + 1}ターン目連続技計算エラー:`, error);
            // フォールバック: 通常技として処理
            calculateKORateProbability(remainingHP, moveDataList, turnIndex, totalDamage, currentProbability, results);
        }
    } else {
        // 通常技の場合は既存の処理
        calculateKORateProbability(remainingHP, moveDataList, turnIndex, totalDamage, currentProbability, results);
    }
}

function calculateMultiHitKORateProbability(remainingHP, moveDataList, turnIndex, totalDamage, currentProbability, results) {
    // HPが0以下になった場合
    if (remainingHP <= 0) {
        // 現在のターン以降すべてに確率を加算
        for (let i = turnIndex; i < results.length; i++) {
            results[i] += currentProbability;
        }
        return;
    }
    
    // すべてのターンを処理した場合
    if (turnIndex >= moveDataList.length) {
        return;
    }
    
    const moveData = moveDataList[turnIndex];
    if (!moveData) {
        // 技が設定されていない場合は次のターンへ
        calculateMultiHitKORateProbability(remainingHP, moveDataList, turnIndex + 1, totalDamage, currentProbability, results);
        return;
    }
    
    // ★重要: 1ターン目で連続技の場合は発生確率を考慮
    if (turnIndex === 0 && currentMove && currentMove.class === 'multi_hit') {
        // 連続技の発生確率
        const hitDistribution = [
            { hits: 2, probability: 3/8 },  // 37.5%
            { hits: 3, probability: 3/8 },  // 37.5%
            { hits: 4, probability: 1/8 },  // 12.5%
            { hits: 5, probability: 1/8 }   // 12.5%
        ];
        
        console.log(`連続技瀕死率計算: 残HP=${remainingHP}, 確率=${(currentProbability * 100).toFixed(4)}%`);
        
        // 技が外れた場合
        const missProbability = 1 - moveData.accuracy;
        if (missProbability > 0) {
            console.log(`  技外れ分岐: 確率=${(currentProbability * missProbability * 100).toFixed(4)}%`);
            calculateMultiHitKORateProbability(remainingHP, moveDataList, turnIndex + 1, totalDamage, currentProbability * missProbability, results);
        }
        
        // 各回数での処理
        for (const { hits, probability } of hitDistribution) {
            const hitProbability = moveData.accuracy * probability;
            
            // この回数での全ダメージパターンを処理
            const singleMinDamage = moveData.minDamage;
            const singleMaxDamage = moveData.maxDamage;
            
            // 各ヒットの組み合わせを簡略化して計算
            const totalMinDamage = singleMinDamage * hits;
            const totalMaxDamage = singleMaxDamage * hits;
            
            // ダメージパターンの処理（急所考慮）
            const normalProb = hitProbability * (15/16); // 急所以外
            const critProb = hitProbability * (1/16);    // 急所
            
            // 通常ダメージ
            for (let i = 0; i < 16; i++) {
                const damage = Math.floor(totalMinDamage + (totalMaxDamage - totalMinDamage) * i / 15);
                const patternProb = currentProbability * normalProb * (1/16);
                
                if (damage >= remainingHP) {
                    // 倒せる場合
                    for (let j = turnIndex; j < results.length; j++) {
                        results[j] += patternProb;
                    }
                } else {
                    // 倒せない場合は次のターンへ
                    calculateMultiHitKORateProbability(
                        remainingHP - damage,
                        moveDataList,
                        turnIndex + 1,
                        totalDamage + damage,
                        patternProb,
                        results
                    );
                }
            }
            
            // 急所ダメージ
            const critTotalMinDamage = totalMinDamage * 2;
            const critTotalMaxDamage = totalMaxDamage * 2;
            
            for (let i = 0; i < 16; i++) {
                const damage = Math.floor(critTotalMinDamage + (critTotalMaxDamage - critTotalMinDamage) * i / 15);
                const patternProb = currentProbability * critProb * (1/16);
                
                if (damage >= remainingHP) {
                    // 倒せる場合
                    for (let j = turnIndex; j < results.length; j++) {
                        results[j] += patternProb;
                    }
                } else {
                    // 倒せない場合は次のターンへ
                    calculateMultiHitKORateProbability(
                        remainingHP - damage,
                        moveDataList,
                        turnIndex + 1,
                        totalDamage + damage,
                        patternProb,
                        results
                    );
                }
            }
            
            console.log(`  ${hits}回攻撃: 基本確率=${(hitProbability * 100).toFixed(3)}%`);
        }
    } else {
        // 通常技または2ターン目以降は既存の処理
        calculateKORateProbability(remainingHP, moveDataList, turnIndex, totalDamage, currentProbability, results);
    }
}

// 回避ランク
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

// 技のダメージ範囲と確率を計算
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

    // ★重要: 常に1発分のダメージを計算（統合版との整合性）
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
    
    // ★連続技でも1発分のダメージを返す（表示用変換は呼び出し側で実行）
    let minDamage = baseDamageMin;
    let maxDamage = baseDamageMax;
    
    // 急所ダメージ計算
    const criticalCheckbox = document.getElementById('criticalCheck');
    const originalCritical = criticalCheckbox.checked;
    criticalCheckbox.checked = true;
    
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
    
    // ★急所も1発分のダメージを返す
    let minCritDamage = baseCritDamageMin;
    let maxCritDamage = baseCritDamageMax;
    
    // 元の状態に戻す
    criticalCheckbox.checked = originalCritical;
    
    // 命中率計算（統合版を使用）
    let finalAccuracy;
    if (move.class === 'multi_hit') {
        // ★統合版の命中率計算を使用
        finalAccuracy = multiHitCalculator.calculateAccuracy(move);
    } else {
        // 通常技は既存の計算
        const weather = document.getElementById('weatherSelect').value;
        
        if (move.accuracy === 0 || (weather === 'rain' && move.name === 'かみなり')) {
            finalAccuracy = 1.0;
        } else {
            let baseAccuracy = (move.accuracy || 100) / 100;
            
            if (document.getElementById('harikiriCheck')?.checked && isPhysical) {
                baseAccuracy *= 0.8;
            }
            
            if (defenderPokemon.item && defenderPokemon.item.name === 'ひかりのこな') {
                baseAccuracy *= 0.9;
            }
            
            const evasionRank = parseInt(document.getElementById('defenderEvasionRank')?.value) || 0;
            if (evasionRank !== 0) {
                const evasionMultiplier = getAccuracyMultiplier(-evasionRank);
                finalAccuracy = Math.min(1, baseAccuracy * evasionMultiplier);
            } else {
                finalAccuracy = baseAccuracy;
            }
        }
        
        // まひの効果（1/4で行動不能）
        const paralysisSelect = document.getElementById('paralysisSelect');
        const paralysisStartTurn = paralysisSelect ? parseInt(paralysisSelect.value) : null;
        if (paralysisStartTurn && paralysisStartTurn !== 'none' && !isNaN(paralysisStartTurn) && turnIndex + 1 >= paralysisStartTurn) {
            finalAccuracy *= 0.75; // 3/4の確率で行動可能
        }
        
        // こんらんの効果（1/2で行動不能）
        const confusionSelect = document.getElementById('confusionSelect');
        const confusionStartTurn = confusionSelect ? parseInt(confusionSelect.value) : null;
        if (confusionStartTurn && confusionStartTurn !== 'none' && !isNaN(confusionStartTurn) && turnIndex + 1 >= confusionStartTurn) {
            finalAccuracy *= 0.5; // 1/2の確率で行動可能
        }
    }
    
    console.log(`ターン${turnIndex + 1}: 1発ダメージ${minDamage}~${maxDamage}, 最終命中率 = ${(finalAccuracy * 100).toFixed(1)}%`);
    
    return {
        accuracy: finalAccuracy,
        minDamage: minDamage,
        maxDamage: maxDamage,
        minCritDamage: minCritDamage,
        maxCritDamage: maxCritDamage
    };
}

function getConstantDamageNames() {
    const names = [];
    
    // 状態異常ダメージ
    const statusType = document.getElementById('statusDamageSelect').value;
    if (statusType !== 'none') {
        const statusNames = {
            'burn': 'やけど',
            'poison': 'どく', 
            'badlypoison': 'もうどく'
        };
        if (statusNames[statusType]) {
            names.push(statusNames[statusType]);
        }
    }
    
    // まきびしダメージ
    const spikesLevel = parseInt(document.getElementById('spikesLevel').value) || 0;
    if (spikesLevel > 0) {
        names.push('まきびし');
    }
    
    // のろいダメージ
    const curseSelect = document.getElementById('curseSelect');
    if (curseSelect && curseSelect.value !== 'none') {
        names.push('のろい');
    }
    
    // あくむダメージ
    const nightmareSelect = document.getElementById('nightmareSelect');
    if (nightmareSelect && nightmareSelect.value !== 'none') {
        names.push('あくむ');
    }
    
    // やどりぎダメージ
    const leechSeedSelect = document.getElementById('leechSeedSelect');
    if (leechSeedSelect && leechSeedSelect.value !== 'none') {
        names.push('やどりぎ');
    }
    
    // 天候ダメージ
    const weather = document.getElementById('weatherSelect').value;
    if (weather === 'sandstorm' || weather === 'hail') {
        const weatherNames = {
            'sandstorm': 'すなあらし',
            'hail': 'あられ'
        };
        if (weatherNames[weather]) {
            names.push(weatherNames[weather]);
        }
    }
    
    return names;
}


// 再帰的に確率を計算
function calculateKORateProbability(remainingHP, moveDataList, turnIndex, totalDamage, currentProbability, results) {
    // HPが0以下になった場合
    if (remainingHP <= 0) {
        // 現在のターン以降すべてに確率を加算（ただし既に加算された分は除く）
        for (let i = turnIndex; i < results.length; i++) {
            results[i] += currentProbability;
        }
        return;
    }
    
    // すべてのターンを処理した場合
    if (turnIndex >= moveDataList.length) {
        return;
    }
    
    const moveData = moveDataList[turnIndex];
    if (!moveData) {
        // 技が設定されていない場合は次のターンへ
        calculateKORateProbability(remainingHP, moveDataList, turnIndex + 1, totalDamage, currentProbability, results);
        return;
    }
    
    //console.log(`ターン${turnIndex + 1} 計算: 残HP=${remainingHP}, 確率=${(currentProbability * 100).toFixed(4)}%`);
    
    // 技が外れた場合
    const missProbability = 1 - moveData.accuracy;
    if (missProbability > 0) {
        //console.log(`  技外れ分岐: 確率=${(currentProbability * missProbability * 100).toFixed(4)}%`);
        calculateKORateProbability(remainingHP, moveDataList, turnIndex + 1, totalDamage, currentProbability * missProbability, results);
    }
    
    // 命中した場合の処理
    const hitProbability = moveData.accuracy;
    if (hitProbability > 0) {
        // 各ダメージパターンを処理
        for (let i = 0; i < 16; i++) {
            // 通常ダメージ
            const normalDamage = Math.floor(moveData.minDamage + (moveData.maxDamage - moveData.minDamage) * i / 15);
            const normalProb = (1/16) * (15/16); // 急所以外の確率
            
            if (normalDamage >= remainingHP) {
                // 倒せる場合
                const koProb = currentProbability * hitProbability * normalProb;
                //console.log(`  通常KO(${i}/16): ダメージ=${normalDamage}, 確率=${(koProb * 100).toFixed(4)}%`);
                for (let j = turnIndex; j < results.length; j++) {
                    results[j] += koProb;
                }
            } else {
                // 倒せない場合は次のターンへ
                const surviveProb = currentProbability * hitProbability * normalProb;
                calculateKORateProbability(
                    remainingHP - normalDamage,
                    moveDataList,
                    turnIndex + 1,
                    totalDamage + normalDamage,
                    surviveProb,
                    results
                );
            }
            
            // 急所ダメージ
            const critDamage = Math.floor(moveData.minCritDamage + (moveData.maxCritDamage - moveData.minCritDamage) * i / 15);
            const critProb = (1/16) * (1/16); // 急所の確率
            
            if (critDamage >= remainingHP) {
                // 倒せる場合
                const koProb = currentProbability * hitProbability * critProb;
                //console.log(`  急所KO(${i}/16): ダメージ=${critDamage}, 確率=${(koProb * 100).toFixed(4)}%`);
                for (let j = turnIndex; j < results.length; j++) {
                    results[j] += koProb;
                }
            } else {
                // 倒せない場合は次のターンへ
                const surviveProb = currentProbability * hitProbability * critProb;
                calculateKORateProbability(
                    remainingHP - critDamage,
                    moveDataList,
                    turnIndex + 1,
                    totalDamage + critDamage,
                    surviveProb,
                    results
                );
            }
        }
    }
}


// フィラ系きのみかチェック
function isFigyBerry(itemName) {
   return ['フィラのみ', 'ウイのみ', 'マゴのみ', 'バンジのみ', 'イアのみ'].includes(itemName);
}

// アイテム効果を考慮した複数ターン瀕死率計算
function calculateMultiTurnKORate(defenderHP, turns = 4) {

    // 防御側アイテムの確認
    const defenderItem = defenderPokemon.item;
    
    const hasItem = defenderItem && (
        defenderItem.name === 'たべのこし' || 
        defenderItem.name === 'オボンのみ' ||
        defenderItem.name === 'くろいヘドロ' ||
        defenderItem.name === 'フィラのみ' ||
        defenderItem.name === 'ウイのみ' ||
        defenderItem.name === 'マゴのみ' ||
        defenderItem.name === 'バンジのみ' ||
        defenderItem.name === 'イアのみ'
    );
    
    try {
        
        // アイテム効果なしの瀕死率
        const basicResult = calculateMultiTurnBasicKORateUnified(defenderHP, turns);
        
        // アイテム効果ありの瀕死率と残HP情報
        let itemResult = null;
        if (hasItem) {          
            try {
                itemResult = calculateMultiTurnKORateWithItems(defenderHP, turns);
            } catch (itemError) {
                console.error('アイテム効果計算でエラー:', itemError);
                console.error('アイテムエラースタック:', itemError.stack);
            }
        }

        const result = {
            basic: basicResult.rates,
            withItems: itemResult ? itemResult.rates : null,
            hpInfo: itemResult ? itemResult.hpInfo : null,
            basis: basicResult.basis,
            hpRanges: basicResult.hpRanges
        };
        
        return result;
        
    } catch (error) {
        console.error('=== calculateMultiTurnKORate内でエラー発生 ===');
        console.error('エラーメッセージ:', error.message);
        console.error('エラータイプ:', error.name);
        console.error('エラースタック:', error.stack);
        console.error('エラー発生時の状態:', {
            defenderHP,
            turns,
            hasItem,
            multiTurnMovesLength: multiTurnMoves.length,
            currentMoveName: currentMove?.name
        });
        
        // エラーを再スローして上位で処理
        throw error;
    }
}

function calculateMultiTurnKORateWithItems(defenderHP, turns) {
    const defenderItem = defenderPokemon.item;
    const itemName = defenderItem ? defenderItem.name : null;
    
    console.log('アイテム考慮瀕死率計算開始:', itemName);
    
    // 各技のダメージ範囲を事前計算
    const moveDataList = [];
    for (let turn = 0; turn < turns; turn++) {
        const move = turn === 0 ? currentMove : multiTurnMoves[turn];
        if (move) {
            const damageData = calculateMoveDamageRange(move, turn);
            moveDataList.push(damageData);
        } else {
            const firstMove = currentMove;
            if (firstMove) {
                const damageData = calculateMoveDamageRange(firstMove, turn);
                moveDataList.push(damageData);
            } else {
                moveDataList.push(null);
            }
        }
    }
    
    const results = Array(turns).fill(0);
    const hpInfo = Array(turns).fill(null);
    
    // アイテムごとの処理分岐
    if (itemName === 'たべのこし') {
        calculateKORateWithLeftovers(defenderHP, defenderHP, moveDataList, 0, 1.0, results, hpInfo, false);
    } else if (itemName === 'オボンのみ') {
        calculateKORateWithSitrusBerry(defenderHP, defenderHP, moveDataList, 0, false, 1.0, results, hpInfo);
    } else if (isFigyBerry(itemName)) {
        calculateKORateWithFigyBerry(defenderHP, defenderHP, moveDataList, 0, false, 1.0, results, hpInfo);
    } else {
        // アイテム効果なしでも定数ダメージは適用
        calculateKORateWithConstantDamage(defenderHP, defenderHP, moveDataList, 0, 1.0, results, hpInfo);
    }
    
    return {
        rates: results.map(rate => rate * 100),
        hpInfo: hpInfo
    };
}


// アイテム効果なしの定数ダメージのみ計算
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
        // ターン終了時の定数ダメージ処理
        const constantDamage = calculateTotalConstantDamage(maxHP, defenderPokemon.types, turnIndex + 1);
        const finalHP = Math.max(0, currentHP - constantDamage);
        
        if (hpInfo) {
            hpInfo[turnIndex] = {
                beforeHeal: currentHP,
                afterHeal: finalHP,
                healAmount: 0,
                constantDamage: constantDamage,
                netHealing: -constantDamage,
                healType: '定数ダメージのみ',
                maxHP: maxHP
            };
        }
        
        calculateKORateWithConstantDamage(finalHP, maxHP, moveDataList, turnIndex + 1, currentProbability, results, hpInfo);
        return;
    }
    
    // 技が外れた場合
    const missProbability = 1 - moveData.accuracy;
    if (missProbability > 0) {
        const constantDamage = calculateTotalConstantDamage(maxHP, defenderPokemon.types, turnIndex + 1);
        const finalHP = Math.max(0, currentHP - constantDamage);
        calculateKORateWithConstantDamage(finalHP, maxHP, moveDataList, turnIndex + 1, currentProbability * missProbability, results, hpInfo);
    }
    
    // 瀕死率計算
    processKORateCalculation(currentHP, maxHP, moveData, turnIndex, currentProbability, results, hpInfo, 
        (remainingHP, prob) => {
            const constantDamage = calculateTotalConstantDamage(maxHP, defenderPokemon.types, turnIndex + 1);
            const finalHP = Math.max(0, remainingHP - constantDamage);
            calculateKORateWithConstantDamage(finalHP, maxHP, moveDataList, turnIndex + 1, prob, results, hpInfo);
        }
    );
}

// たべのこしを考慮した確率計算関数
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
        
        // 定数ダメージを計算
        const constantDamage = calculateTotalConstantDamage(maxHP, defenderPokemon.types, turnIndex + 1);
        
        // 回復量から定数ダメージを差し引き
        const netHealing = healAmount - constantDamage;
        const finalHP = Math.max(0, Math.min(currentHP + netHealing, maxHP));
        
        if (hpInfo) {
            hpInfo[turnIndex] = {
                beforeHeal: currentHP,
                afterHeal: finalHP,
                healAmount: healAmount,
                constantDamage: constantDamage,
                netHealing: netHealing,
                healType: 'たべのこし',
                maxHP: maxHP
            };
        }
        
        calculateKORateWithLeftovers(finalHP, maxHP, moveDataList, turnIndex + 1, currentProbability, results, hpInfo, berryUsed);
        return;
    }
    
    // 技が外れた場合
    const missProbability = 1 - moveData.accuracy;
    if (missProbability > 0) {
        let healAmount = Math.floor(maxHP / 16);
        const constantDamage = calculateTotalConstantDamage(maxHP, defenderPokemon.types, turnIndex + 1);
        const netHealing = healAmount - constantDamage;
        const finalHP = Math.max(0, Math.min(currentHP + netHealing, maxHP));
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
            
            let healAmount = Math.floor(maxHP / 16);
            const constantDamage = calculateTotalConstantDamage(maxHP, defenderPokemon.types, turnIndex + 1);
            const netHealing = healAmount - constantDamage;
            const finalHP = Math.max(0, Math.min(remainingHP + netHealing, maxHP));
            calculateKORateWithLeftovers(finalHP, maxHP, moveDataList, turnIndex + 1, prob, results, hpInfo, berryUsed);
        }
    );
}

// オボンのみ効果を考慮した確率計算
function calculateKORateWithSitrusBerry(currentHP, maxHP, moveDataList, turnIndex, berryUsed, currentProbability, results, hpInfo) {
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
        const constantDamage = calculateTotalConstantDamage(maxHP, defenderPokemon.types, turnIndex + 1);
        const finalHP = Math.max(0, currentHP - constantDamage);
        
        if (hpInfo) {
            hpInfo[turnIndex] = {
                beforeHeal: currentHP,
                afterHeal: finalHP,
                healAmount: 0,
                constantDamage: constantDamage,
                netHealing: -constantDamage,
                healType: berryUsed ? 'オボンのみ(使用済み)' : 'オボンのみ(未発動)',
                maxHP: maxHP,
                berryActivated: false
            };
        }
        
        calculateKORateWithSitrusBerry(finalHP, maxHP, moveDataList, turnIndex + 1, berryUsed, currentProbability, results, hpInfo);
        return;
    }
    
    // 技が外れた場合
    const missProbability = 1 - moveData.accuracy;
    if (missProbability > 0) {
        // ターン終了時の定数ダメージ適用
        const constantDamage = calculateTotalConstantDamage(maxHP, defenderPokemon.types, turnIndex + 1);
        const finalHP = Math.max(0, currentHP - constantDamage);
        calculateKORateWithSitrusBerry(finalHP, maxHP, moveDataList, turnIndex + 1, berryUsed, currentProbability * missProbability, results, hpInfo);
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
            
            // オボンのみ発動チェック（HP50%以下で30回復、1回のみ、瀕死でない場合のみ）
            if (!berryUsed && remainingHP <= maxHP / 2) {
                const healAmount = 30;
                let healedHP = Math.min(remainingHP + healAmount, maxHP);
                
                // 定数ダメージを適用
                const constantDamage = calculateTotalConstantDamage(maxHP, defenderPokemon.types, turnIndex + 1);
                const finalHP = Math.max(0, healedHP - constantDamage);
                const netHealing = healAmount - constantDamage;
                
                if (hpInfo && !hpInfo[turnIndex]) {
                    hpInfo[turnIndex] = {
                        beforeHeal: remainingHP,
                        afterHeal: finalHP,
                        healAmount: healAmount,
                        constantDamage: constantDamage,
                        netHealing: netHealing,
                        healType: 'オボンのみ',
                        berryActivated: true,
                        activationTurn: turnIndex + 1,
                        maxHP: maxHP
                    };
                }
                
                calculateKORateWithSitrusBerry(finalHP, maxHP, moveDataList, turnIndex + 1, true, prob, results, hpInfo);
            } else {
                // きのみ使用済みまたは発動条件を満たさない
                const constantDamage = calculateTotalConstantDamage(maxHP, defenderPokemon.types, turnIndex + 1);
                const finalHP = Math.max(0, remainingHP - constantDamage);
                
                if (hpInfo && !hpInfo[turnIndex]) {
                    hpInfo[turnIndex] = {
                        beforeHeal: remainingHP,
                        afterHeal: finalHP,
                        healAmount: 0,
                        constantDamage: constantDamage,
                        netHealing: -constantDamage,
                        healType: berryUsed ? 'オボンのみ(使用済み)' : 'オボンのみ(未発動)',
                        berryActivated: false,
                        activationTurn: null,
                        maxHP: maxHP
                    };
                }
                
                calculateKORateWithSitrusBerry(finalHP, maxHP, moveDataList, turnIndex + 1, berryUsed, prob, results, hpInfo);
            }
        }
    );
}

// フィラ系きのみ効果を考慮した確率計算
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
        const constantDamage = calculateTotalConstantDamage(maxHP, defenderPokemon.types, turnIndex + 1);
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
        // ターン終了時の定数ダメージ適用
        const constantDamage = calculateTotalConstantDamage(maxHP, defenderPokemon.types, turnIndex + 1);
        const finalHP = Math.max(0, currentHP - constantDamage);
        calculateKORateWithFigyBerry(finalHP, maxHP, moveDataList, turnIndex + 1, berryUsed, currentProbability * missProbability, results, hpInfo);
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
            
            // フィラ系きのみ発動チェック（HP50%以下で最大HPの1/8回復、1回のみ、瀕死でない場合のみ）
            if (!berryUsed && remainingHP <= maxHP / 2) {
                const healAmount = Math.floor(maxHP / 8);
                let healedHP = Math.min(remainingHP + healAmount, maxHP);
                
                // 定数ダメージを適用
                const constantDamage = calculateTotalConstantDamage(maxHP, defenderPokemon.types, turnIndex + 1);
                const finalHP = Math.max(0, healedHP - constantDamage);
                const netHealing = healAmount - constantDamage;
                const berryName = defenderPokemon.item ? defenderPokemon.item.name : 'フィラ系きのみ';
                
                if (hpInfo) {
                    hpInfo[turnIndex] = {
                        beforeHeal: remainingHP,
                        afterHeal: finalHP,
                        healAmount: healAmount,
                        constantDamage: constantDamage,
                        netHealing: netHealing,
                        healType: berryName,
                        berryActivated: true,
                        activationTurn: turnIndex + 1,
                        maxHP: maxHP
                    };
                }
                
                calculateKORateWithFigyBerry(finalHP, maxHP, moveDataList, turnIndex + 1, true, prob, results, hpInfo);
            } else {
                // きのみ使用済みまたは発動条件を満たさない
                const constantDamage = calculateTotalConstantDamage(maxHP, defenderPokemon.types, turnIndex + 1);
                const finalHP = Math.max(0, remainingHP - constantDamage);
                const berryName = defenderPokemon.item ? defenderPokemon.item.name : 'フィラ系きのみ';
                
                if (hpInfo && !hpInfo[turnIndex]) {
                    hpInfo[turnIndex] = {
                        beforeHeal: remainingHP,
                        afterHeal: finalHP,
                        healAmount: 0,
                        constantDamage: constantDamage,
                        netHealing: -constantDamage,
                        healType: berryUsed ? `${berryName}(使用済み)` : `${berryName}(未発動)`,
                        berryActivated: false,
                        activationTurn: null,
                        maxHP: maxHP
                    };
                }
                
                calculateKORateWithFigyBerry(finalHP, maxHP, moveDataList, turnIndex + 1, berryUsed, prob, results, hpInfo);
            }
        }
    );
}

// 共通の瀕死率計算処理
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

// ========================
// 10. 結果表示の改良
// ========================

function displayEnhancedDamageResult(minDamage, maxDamage, totalHP) {
   // 複数ターン技が設定されているかチェック
   if (hasMultiTurnMoves()) {
       const defenderStats = calculateStats(defenderPokemon);
       displayMultiTurnResults(defenderStats.hp, false);
       return;
   }
   
   // 単発技の場合は統合版を直接呼び出し
   displaySingleTurnResult(minDamage, maxDamage, totalHP);
}

// 結果表示の統合関数
function displayUnifiedResults(minDamage, maxDamage, totalHP, isMultiTurn = false, atkRank = '±0', defRank = '±0') {
    const resultDiv = document.getElementById('calculationResult');
    
    // 1ターン目の技を設定
    multiTurnMoves[0] = currentMove;
    
    // 実際に設定されている技の数を確認
    let actualTurns = 1; // 最低1ターン
    for (let i = 1; i < 5; i++) {
        if (multiTurnMoves[i] && multiTurnMoves[i].name) {
            actualTurns = i + 1;
        }
    }
    
    // 状態異常がある場合は最低2ターン計算
    const paralysisSelect = document.getElementById('paralysisSelect');
    const confusionSelect = document.getElementById('confusionSelect');
    const hasParalysis = paralysisSelect && paralysisSelect.value !== 'none';
    const hasConfusion = confusionSelect && confusionSelect.value !== 'none';
    const hasStatusAbnormality = hasParalysis || hasConfusion;
    
    if (isMultiTurn && hasStatusAbnormality && actualTurns < 2) {
        actualTurns = 2; // 状態異常がある場合は最低2ターン
    }
    
    // 状態異常のみがある場合（技が1つしかない場合）の処理
    if (hasStatusAbnormality && actualTurns === 1) {
        const paralysisValue = hasParalysis ? parseInt(paralysisSelect.value) || 1 : 0;
        const confusionValue = hasConfusion ? parseInt(confusionSelect.value) || 1 : 0;
        const maxStatusTurn = Math.max(paralysisValue, confusionValue);
        actualTurns = Math.max(2, maxStatusTurn);
        
        // 2ターン目以降は1ターン目と同じ技を使用
        for (let i = 1; i < actualTurns; i++) {
            if (!multiTurnMoves[i]) {
                multiTurnMoves[i] = currentMove;
            }
        }
    }
    
    // 状態異常があるが技が設定されていないターンがある場合の追加処理
    if (hasStatusAbnormality) {
        const paralysisValue = hasParalysis ? parseInt(paralysisSelect.value) || 1 : 0;
        const confusionValue = hasConfusion ? parseInt(confusionSelect.value) || 1 : 0;
        const maxStatusTurn = Math.max(paralysisValue || 0, confusionValue || 0);
        const neededTurns = Math.max(actualTurns, maxStatusTurn, 2);

        for (let i = actualTurns; i < neededTurns; i++) {
            if (!multiTurnMoves[i]) {
                multiTurnMoves[i] = currentMove;
            }
        }
        actualTurns = neededTurns;
    }
    
    // ステータス計算
    const attackerStats = calculateStats(attackerPokemon);
    const defenderStats = calculateStats(defenderPokemon);
    
    // 技の分類に応じて実数値を取得
    const isPhysical = currentMove.category === "Physical";
    const attackerOffensiveStat = isPhysical ? attackerStats.a : attackerStats.c;
    const defenderDefensiveStat = isPhysical ? defenderStats.b : defenderStats.d;
    
    // 現在HPを取得
    let currentHP = totalHP;
    const isSubstitute = document.getElementById('substituteCheck')?.checked || false;
    
    if (isSubstitute) {
        currentHP = Math.floor(totalHP / 4);
    } else {
        const currentHPInput = document.getElementById('defenderCurrentHP');
        if (currentHPInput && currentHPInput.value) {
            currentHP = parseInt(currentHPInput.value) || totalHP;
        }
    }
    
    // ★修正: 連続技の場合の表示用ダメージ範囲計算（リスト選択対応）
    let displayMinDamage = minDamage;
    let displayMaxDamage = maxDamage;
    
    // 連続技の場合はリストの選択に応じて表示範囲を計算
    if (currentMove && currentMove.class === 'multi_hit') {
        const hitCountSelect = document.getElementById('multiHitCount');
        const selectedHitCount = hitCountSelect ? hitCountSelect.value : '2-5';
        const constantDamage = calculateTotalConstantDamage(totalHP, defenderPokemon.types, 1);
        
        if (selectedHitCount === '2-5') {
            // 2-5回の場合
            displayMinDamage = minDamage * 2 + constantDamage;
            displayMaxDamage = maxDamage * 5 + constantDamage;
            //console.log(`連続技表示用ダメージ範囲: ${displayMinDamage}~${displayMaxDamage} (2~5回)`);
        } else {
            // 固定回数の場合
            const hitCount = parseInt(selectedHitCount);
            displayMinDamage = minDamage * hitCount + constantDamage;
            displayMaxDamage = maxDamage * hitCount + constantDamage;
            //console.log(`連続技表示用ダメージ範囲: ${displayMinDamage}~${displayMaxDamage} (${hitCount}回)`);
        }
    } else if (currentMove && currentMove.class === 'two_hit') {
        displayMinDamage = minDamage * 2;
        displayMaxDamage = maxDamage * 2;
        //console.log(`2回攻撃表示用ダメージ範囲: ${displayMinDamage}~${displayMaxDamage}`);
    } else {
        //console.log(`通常技表示用ダメージ範囲: ${displayMinDamage}~${displayMaxDamage}`);
    }
    
    // 現在の技から命中率を取得
    const moveAccuracy = currentMove ? (currentMove.accuracy || 100) : 100;
    const accuracyText = moveAccuracy < 100 ? `, 命中${moveAccuracy}` : '';
    
    // 定数ダメージを計算
    const constantDamage = calculateTotalConstantDamage(totalHP, defenderPokemon.types, 1);
    
    // 瀕死率計算（実際の技数分だけ）
    let koRatesTurns = actualTurns;
    
    // 状態異常がある場合は、状態異常の最大ターン数まで計算
    if (hasStatusAbnormality) {
        const paralysisValue = paralysisSelect && paralysisSelect.value !== 'none' ? parseInt(paralysisSelect.value) : 0;
        const confusionValue = confusionSelect && confusionSelect.value !== 'none' ? parseInt(confusionSelect.value) : 0;
        const maxStatusTurn = Math.max(paralysisValue || 0, confusionValue || 0);
        koRatesTurns = Math.max(actualTurns, maxStatusTurn, 2);
    }

    // ★修正: 連続技の場合は瀕死率計算を先に実行し、その結果を乱数表示でも使用
    let basicRand;
    let koRates;
    
    if (currentMove && currentMove.class === 'multi_hit' && !isMultiTurn) {
        const hitCountSelect = document.getElementById('multiHitCount');
        const selectedHitCount = hitCountSelect ? hitCountSelect.value : '2-5';

        if (selectedHitCount === '2-5') {
            // 2-5回の場合：純粋なダメージ範囲での判定
            basicRand = calculateSimpleRandText(displayMinDamage, displayMaxDamage, currentHP, isSubstitute, "2-5");
        } else {
            // 固定回数の場合：純粋なダメージ範囲での判定
            const hitCount = parseInt(selectedHitCount);
            basicRand = calculateSimpleRandText(displayMinDamage, displayMaxDamage, currentHP, isSubstitute, hitCount);
        }

        // 瀕死率計算は別途実行（急所・命中率込みの詳細計算用）
        koRates = calculateMultiTurnKORate(totalHP, koRatesTurns);
    }
    else {
        // 通常技の場合も乱数計算を実行
        basicRand = calculateRandText(displayMinDamage, displayMaxDamage, totalHP, currentMove);
        // 瀕死率計算も実行
        koRates = calculateMultiTurnKORate(totalHP, koRatesTurns);
    }
    
    // 平均ダメージ（定数ダメージ込み）- 表示用ダメージを使用
    const avgDamage = (displayMinDamage + displayMaxDamage) / 2;
    
    // ★修正: HPバー作成（表示用ダメージ範囲で作成）
    const hpBarHtml = createHPBar(displayMinDamage, displayMaxDamage, totalHP, false);
    
    // 設定された技の情報を取得（威力計算を修正）
    const moveInfo = [];
    for (let i = 0; i < actualTurns; i++) {
        if (multiTurnMoves[i]) {
            const move = multiTurnMoves[i];
            const displayPower = calculatePower(move);
            
            moveInfo.push({
                turn: i + 1,
                name: move.name,
                power: displayPower,
                type: move.type,
                category: move.category === 'Physical' ? '物理' : '特殊',
                accuracy: move.accuracy || 100
            });
        }
    }
    
    // 1発目の確定/乱数表記を生成
    let koSummaryText = '';
    let targetInfo = '';
    
    if (basicRand.isSubstitute) {
        targetInfo = `(みがわり: ${basicRand.targetHP}HP) `;
    } else if (basicRand.targetHP !== totalHP) {
        targetInfo = `(現在HP: ${basicRand.targetHP}) `;
    }
    
    if (basicRand.percent) {
        koSummaryText = `${targetInfo}${basicRand.randLevel}${basicRand.hits}発 (${basicRand.percent}%)`;
    } else {
        koSummaryText = `${targetInfo}${basicRand.randLevel}${basicRand.hits}発`;
    }
    
    // ランク補正情報を生成
    const getRankText = (rank, type) => {
        if (rank === '±0' || rank === '0') return '';
        return ` / ${rank}`;
    };
    
    const atkRankText = getRankText(atkRank, '攻撃');
    const defRankText = getRankText(defRank, '防御');
    const rankText = atkRankText + defRankText;
    
    // 回避ランク情報を取得
    const evasionRank = document.getElementById('defenderEvasionRank')?.value || '±0';
    const evasionRankText = (evasionRank !== '±0' && evasionRank !== '0') ? ` / 回避ランク${evasionRank}` : '';
    
    // 瀕死率表示のHTML生成
    const koRateHtml = isMultiTurn ? 
        generateEnhancedMultiTurnKORateHTML(koRates, actualTurns, moveInfo, evasionRankText) :
        generateSingleTurnKORateHTML(koRates, moveAccuracy, evasionRankText);
    
    // タイトルを条件分岐
    const title = isMultiTurn ? '複数ターン瀕死率計算結果' : 'ダメージ計算結果';
    
    // ダメージ範囲の表記（複数ターンかどうかで変更）
    const damageRangeLabel = isMultiTurn ? '1発目のダメージ範囲' : 'ダメージ範囲';
    
    // ステータス表記の生成
    const offenseStatLabel = isPhysical ? 'A' : 'C';
    const defenseStatLabel = isPhysical ? 'B' : 'D';
    
    // 防御側HP表記の生成（現在HPベース）
    let defenderHPDisplay = '';
    if (isSubstitute) {
        defenderHPDisplay = `H${currentHP}(みがわり)`;
    } else if (currentHP === totalHP) {
        defenderHPDisplay = `H${currentHP}`;
    } else {
        defenderHPDisplay = `H${currentHP}/${totalHP}`;
    }
    
    // ★修正: 連続技の場合の表示調整（リスト選択対応）
    let moveDisplayText = '';
    if (currentMove && currentMove.class === 'multi_hit') {
        // 連続技の場合はリストの選択に応じて表示
        const hitCountSelect = document.getElementById('multiHitCount');
        const selectedHitCount = hitCountSelect ? hitCountSelect.value : '2-5';
        
        if (selectedHitCount === '2-5') {
            moveDisplayText = `${currentMove.name} (威力${calculatePower(currentMove)}×2-5発, ${currentMove.type}, ${currentMove.category === 'Physical' ? '物理' : '特殊'}${accuracyText})`;
        } else {
            const hitCount = parseInt(selectedHitCount);
            moveDisplayText = `${currentMove.name} (威力${calculatePower(currentMove)}×${hitCount}発, ${currentMove.type}, ${currentMove.category === 'Physical' ? '物理' : '特殊'}${accuracyText})`;
        }
    } else if (currentMove && currentMove.class === 'two_hit') {
        // 2回攻撃の場合
        moveDisplayText = `${currentMove.name} (威力${calculatePower(currentMove)}×2発, ${currentMove.type}, ${currentMove.category === 'Physical' ? '物理' : '特殊'}${accuracyText})`;
    } else {
        // 通常技の場合
        moveDisplayText = `${currentMove.name} (威力${calculatePower(currentMove)}, ${currentMove.type}, ${currentMove.category === 'Physical' ? '物理' : '特殊'}${accuracyText})`;
    }
    
    let resultHtml = `
        <div class="damage-result">
            <h3>${title}</h3>
            <div class="result-info">
                <p><strong>攻撃側:</strong> ${attackerPokemon.name} Lv.${attackerPokemon.level} ${offenseStatLabel}${attackerOffensiveStat}</p>
                <p><strong>防御側:</strong> ${defenderPokemon.name} Lv.${defenderPokemon.level} ${defenderHPDisplay}-${defenseStatLabel}${defenderDefensiveStat}</p>
                ${isMultiTurn ? `
                <div class="move-sequence">
                    <strong>技構成:</strong>
                    ${moveInfo.map(move => `
                        <div style="margin-left: 10px; font-size: 13px;">
                            ${move.turn}: ${move.name} (威力${move.power} / 命中${move.accuracy})
                        </div>
                    `).join('')}
                </div>
                ` : `
                <p><strong>使用技:</strong> ${moveDisplayText}</p>
                ${rankText ? `<p><strong>ランク補正:</strong> ${rankText.substring(3)}</p>` : ''}
                `}
            </div>
            <div class="result-info2">
                <p><strong>${damageRangeLabel}:</strong> ${displayMinDamage}～${displayMaxDamage} ${isMultiTurn ? `(平均: ${Math.floor(avgDamage)})` : ''}</p>
                <p><strong>割合:</strong> ${(displayMinDamage / currentHP * 100).toFixed(1)}%～${(displayMaxDamage / currentHP * 100).toFixed(1)}%</p>
                <p>${koSummaryText}</p>
            </div>
            ${hpBarHtml}

            ${koRateHtml}
        </div>
    `;
    resultDiv.innerHTML = resultHtml;
}

function calculateSimpleRandText(minDamage, maxDamage, targetHP, isSubstitute, hitCount) {
    const effectiveMinDamage = minDamage;
    const effectiveMaxDamage = maxDamage;
    
    // 確定1発判定
    if (effectiveMinDamage >= targetHP) {
        return {
            hits: 1,
            percent: null,
            randLevel: "確定",
            effectiveMinDamage: effectiveMinDamage,
            effectiveMaxDamage: effectiveMaxDamage,
            isSubstitute: isSubstitute,
            targetHP: targetHP
        };
    }
    
    // 乱数1発判定
    if (effectiveMaxDamage >= targetHP) {
        const successfulRange = effectiveMaxDamage - Math.max(effectiveMinDamage, targetHP) + 1;
        const totalRange = effectiveMaxDamage - effectiveMinDamage + 1;
        const successRate = (successfulRange / totalRange) * 100;
        
        let randLevel = "";
        if (successRate >= 93.75) {
            randLevel = "超高乱数";
        } else if (successRate >= 75.0) {
            randLevel = "高乱数";
        } else if (successRate >= 62.5) {
            randLevel = "中高乱数";
        } else if (successRate >= 37.5) {
            randLevel = "中乱数";
        } else if (successRate >= 25.0) {
            randLevel = "中低乱数";
        } else if (successRate > 6.3) {
            randLevel = "低乱数";
        } else {
            randLevel = "超低乱数";
        }
        
        return {
            hits: 1,
            percent: successRate.toFixed(1),
            randLevel: randLevel,
            effectiveMinDamage: effectiveMinDamage,
            effectiveMaxDamage: effectiveMaxDamage,
            isSubstitute: isSubstitute,
            targetHP: targetHP
        };
    }
    
    // 2発以上必要な場合の判定
    const minHits = Math.ceil(targetHP / effectiveMaxDamage); // 最小必要回数
    const maxHits = Math.ceil(targetHP / effectiveMinDamage); // 最大必要回数
    
    if (minHits === maxHits) {
        // 確定n発
        return {
            hits: minHits,
            percent: null,
            randLevel: "確定",
            effectiveMinDamage: effectiveMinDamage,
            effectiveMaxDamage: effectiveMaxDamage,
            isSubstitute: isSubstitute,
            targetHP: targetHP
        };
    } else {
        // 乱数n発（最小回数で表示）
        // 簡易的な乱数計算
        let successRate = 50.0; // デフォルト値
        
        // より正確な計算が必要な場合はここで実装
        if (minHits === 2 && maxHits > 2) {
            // 2発で倒せる確率を計算
            const totalOutcomes = Math.pow(effectiveMaxDamage - effectiveMinDamage + 1, 2);
            let successfulOutcomes = 0;
            
            for (let dmg1 = effectiveMinDamage; dmg1 <= effectiveMaxDamage; dmg1++) {
                const requiredDmg2 = targetHP - dmg1;
                if (requiredDmg2 <= 0) {
                    successfulOutcomes += effectiveMaxDamage - effectiveMinDamage + 1;
                } else if (requiredDmg2 <= effectiveMaxDamage) {
                    successfulOutcomes += Math.max(0, effectiveMaxDamage - Math.max(effectiveMinDamage, requiredDmg2) + 1);
                }
            }
            
            successRate = (successfulOutcomes / totalOutcomes) * 100;
        }
        
        let randLevel = "";
        if (successRate >= 93.75) {
            randLevel = "超高乱数";
        } else if (successRate >= 75.0) {
            randLevel = "高乱数";
        } else if (successRate >= 62.5) {
            randLevel = "中高乱数";
        } else if (successRate >= 37.5) {
            randLevel = "中乱数";
        } else if (successRate >= 25.0) {
            randLevel = "中低乱数";
        } else if (successRate > 6.3) {
            randLevel = "低乱数";
        } else {
            randLevel = "超低乱数";
        }
        
        return {
            hits: minHits,
            percent: successRate.toFixed(1),
            randLevel: randLevel,
            effectiveMinDamage: effectiveMinDamage,
            effectiveMaxDamage: effectiveMaxDamage,
            isSubstitute: isSubstitute,
            targetHP: targetHP
        };
    }
}

function displayMultiTurnResults(totalHP, isSingleMove = false) {
    // 実際に複数ターン技が設定されている場合のみ呼び出される

    // ランク補正取得
    const atkRankElement = document.getElementById('attackerAtkRank');
    const defRankElement = document.getElementById('defenderDefRank');
    
    const atkRank = atkRankElement ? atkRankElement.value : '±0';
    const defRank = defRankElement ? defRankElement.value : '±0';
    
    // 最初の技のダメージ計算
    const attackerStats = calculateStats(attackerPokemon);
    const defenderStats = calculateStats(defenderPokemon);
    const isPhysical = currentMove.category === "Physical";
    const attackValue = isPhysical ? attackerStats.a : attackerStats.c;
    const defenseValue = isPhysical ? defenderStats.b : defenderStats.d;
    
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
    
    // 複数ターン表示として処理
    displayUnifiedResults(minDamage, maxDamage, totalHP, true, atkRank, defRank);
}

// 単発ターン結果表示（統合版を呼び出し）
function displaySingleTurnResult(minDamage, maxDamage, totalHP) {
    displayUnifiedResults(minDamage, maxDamage, totalHP, false);
}

// 複数ターン瀕死率表示HTML生成
function generateEnhancedMultiTurnKORateHTML(koRates, actualTurns, moveInfo, evasionRankText = '') {
    if (!koRates || !koRates.basic) return '';
    
    const defenderItem = defenderPokemon.item;
    const hasItemEffect = defenderItem && (
        defenderItem.name === 'たべのこし' || 
        defenderItem.name === 'オボンのみ' ||
        defenderItem.name === 'くろいヘドロ' ||
        isFigyBerry(defenderItem.name)
    );
    
    let html = '<div class="ko-rate-section"><h4>瀕死率詳細</h4>';
    
    // 計算条件の説明
    html += '<div class="calculation-conditions" style="text-align: center; margin-bottom: 10px; font-size: 11px; color: #666;">';
    html += '急所率1/16を考慮';
    if (evasionRankText) {
        html += evasionRankText;
    }
    html += '</div>';
    
    // アイテム情報の表示
    if (hasItemEffect) {
        html += `<div class="item-info" style="text-align: center; margin-bottom: 10px; font-size: 12px; color: #666;">
            持ち物: ${defenderItem.name}
        </div>`;
    }
    
    // 天候情報の表示（雨天時のかみなりの場合）
    const weather = document.getElementById('weatherSelect').value;
    const hasWeatherEffect = weather === 'rain' && moveInfo.some(move => move.name === 'かみなり');
    if (hasWeatherEffect) {
        html += `<div class="weather-info" style="text-align: center; margin-bottom: 10px; font-size: 12px; color: #17a2b8;">
            天候: あめ（かみなり必中）
        </div>`;
    }
    
    // はりきり情報の表示
    const hasHarikiri = document.getElementById('harikiriCheck')?.checked;
    if (hasHarikiri) {
        html += `<div class="ability-info" style="text-align: center; margin-bottom: 10px; font-size: 12px; color: #dc3545;">
            特性: はりきり（命中率0.8倍）
        </div>`;
    }
    
    // 実際に設定されたターン数分だけ表示
    for (let turn = 0; turn < actualTurns; turn++) {
        const turnNumber = turn + 1;
        const basicRate = koRates.basic[turn];
        const itemRate = koRates.withItems ? koRates.withItems[turn] : null;
        
        // 各ターンの定数ダメージ名を取得
        const constantDamageNames = getConstantDamageNamesForTurn(turnNumber);
        
        // 各ターンのダメージ範囲を定数ダメージ込みで計算
        const damageWithConstant = calculateDamageWithConstantForTurn(turn, moveInfo[turn]);
        
        // 計算根拠を生成
        let basis = '';
        if (koRates.basis && koRates.basis[turn]) {
            const b = koRates.basis[turn];
            const move = moveInfo[turn];
            let acc = b.accuracy;
            
            // 技名に定数ダメージ名を追加
            let moveNameWithConstantDamage = move.name;
            if (constantDamageNames.length > 0) {
                moveNameWithConstantDamage += '+' + constantDamageNames.join('+');
            }
            
            // 特殊な命中率の説明を追加
            let accText = `命中${acc}%`;
            if (weather === 'rain' && move.name === 'かみなり') {
                accText = '必中（雨天）';
            } else if (move.accuracy === 0) {
                accText = '必中';
            } else if (hasHarikiri && move.category === '物理') {
                accText += '（はりきり補正済）';
            }
            
            // 状態異常効果を「×」区切りで表示
            if (b.statusEffects && b.statusEffects.length > 0) {
                const statusModifiers = [];
                b.statusEffects.forEach(effect => {
                    if (effect.includes('ひかりのこな')) {
                        statusModifiers.push('ひかりのこな');
                    } else if (effect.includes('まひ')) {
                        statusModifiers.push('まひ');
                    } else if (effect.includes('こんらん')) {
                        statusModifiers.push('こんらん');
                    }
                });
                if (statusModifiers.length > 0) {
                    accText += `×${statusModifiers.join('×')}`;
                }
            }
            
            basis = `[${moveNameWithConstantDamage} (ダメージ:${damageWithConstant.min}~${damageWithConstant.max})]<br>`;
            
            // ★修正: 連続技かどうかで表示テキストを変更
            if (b.isMultiHit) {
                basis += `連続技各回数の発生確率と外れ時の両方を考慮<br>`;
            } else {
                if (turn === 0) {
                    basis += `命中時と外れ時の両方を考慮<br>`;
                } else {
                    basis += `前ターンの結果を考慮した累積計算<br>`;
                }
            }
            
            basis += `×${accText}`;
        }

        html += `<div class="ko-rate-row">`;
        
        // 1行目: ターン番号と瀕死率
        html += `<div class="ko-rate-header">`;
        html += `<span class="ko-turn">${turnNumber}ターン:</span>`;
        
        // アイテム効果がある場合は、アイテム考慮の瀕死率を表示
        if (hasItemEffect && itemRate !== null) {
            html += `<span class="ko-basic">${Math.floor(itemRate * 10) / 10}%</span>`;
        } else {
            html += `<span class="ko-basic">${Math.floor(basicRate * 10) / 10}%</span>`;
        }
        html += `</div>`;
        
        // 2行目: 計算根拠
        html += `<div class="ko-basis">${basis}</div>`;
        
        // 3行目以降: 残HP範囲の表示
        if (koRates.hpRanges && koRates.hpRanges[turn]) {
            const hpRange = koRates.hpRanges[turn];
            html += `<div class="hp-range-row">`;
            if (hpRange.min === 0 && hpRange.max === 0) {
                html += `<span class="hp-range-text">残HP範囲: 0/${hpRange.initial}</span>`;
            } else {
                let hpText = `残HP範囲: ${hpRange.min}~${hpRange.max}/${hpRange.initial}`;
                
                // 回復効果の表示
                if (hpRange.healType && hpRange.healAmount > 0) {
                    hpText += ` (${hpRange.healType} +${hpRange.healAmount})`;
                }
                
                // 定数ダメージの表示
                if (hpRange.constantDamage && hpRange.constantDamage > 0) {
                    const damageDetails = [];
                    
                    // 状態異常ダメージ
                    const statusType = document.getElementById('statusDamageSelect').value;
                    if (statusType !== 'none') {
                        const statusNames = {
                            'burn': 'やけど',
                            'poison': 'どく', 
                            'badlypoison': 'もうどく'
                        };
                        const statusDamage = calculateStatusDamage(hpRange.maxHP || defenderPokemon.maxHP, statusType, turn + 1);
                        if (statusDamage > 0) {
                            damageDetails.push(`${statusNames[statusType]} -${statusDamage}`);
                        }
                    }
                    
                    // まきびしダメージ
                    const spikesLevel = parseInt(document.getElementById('spikesLevel').value) || 0;
                    const spikesDamage = calculateSpikesDamage(hpRange.maxHP || defenderPokemon.maxHP, spikesLevel, turn + 1);
                    if (spikesDamage > 0) {
                        damageDetails.push(`まきびし -${spikesDamage}`);
                    }
                    
                    // のろいダメージ
                    const curseSelect = document.getElementById('curseSelect');
                    if (curseSelect && curseSelect.value !== 'none') {
                        const curseStartTurn = parseInt(curseSelect.value);
                        if (!isNaN(curseStartTurn) && turn + 1 >= curseStartTurn) {
                            const curseDamage = calculateCurseDamage(hpRange.maxHP || defenderPokemon.maxHP);
                            damageDetails.push(`のろい -${curseDamage}`);
                        }
                    }
                    
                    // あくむダメージ
                    const nightmareSelect = document.getElementById('nightmareSelect');
                    if (nightmareSelect && nightmareSelect.value !== 'none') {
                        const nightmareStartTurn = parseInt(nightmareSelect.value);
                        if (!isNaN(nightmareStartTurn) && turn + 1 >= nightmareStartTurn) {
                            const nightmareDamage = calculateNightmareDamage(hpRange.maxHP || defenderPokemon.maxHP);
                            damageDetails.push(`あくむ -${nightmareDamage}`);
                        }
                    }
                    
                    // やどりぎダメージ
                    const leechSeedSelect = document.getElementById('leechSeedSelect');
                    if (leechSeedSelect && leechSeedSelect.value !== 'none') {
                        const leechSeedStartTurn = parseInt(leechSeedSelect.value);
                        if (!isNaN(leechSeedStartTurn) && turn + 1 >= leechSeedStartTurn) {
                            const leechSeedDamage = calculateLeechSeedDamage(hpRange.maxHP || defenderPokemon.maxHP);
                            damageDetails.push(`やどりぎ -${leechSeedDamage}`);
                        }
                    }
                    
                    // 天候ダメージ
                    const weather = document.getElementById('weatherSelect').value;
                    const weatherDamage = calculateWeatherDamage(hpRange.maxHP || defenderPokemon.maxHP, defenderPokemon.types, weather);
                    if (weatherDamage > 0) {
                        const weatherNames = {
                            'sandstorm': 'すなあらし',
                            'hail': 'あられ'
                        };
                        damageDetails.push(`${weatherNames[weather]} -${weatherDamage}`);
                    }
                    
                    if (damageDetails.length > 0) {
                        hpText += ` (${damageDetails.join(', ')})`;
                    }
                }
                
                // 正味の効果表示
                if (hpRange.netHealing !== undefined && hpRange.netHealing !== 0) {
                    const netText = hpRange.netHealing > 0 ? `+${hpRange.netHealing}` : `${hpRange.netHealing}`;
                    hpText += ` [正味: ${netText}]`;
                }
                
                html += `<span class="hp-range-text">${hpText}</span>`;
            }
            html += `</div>`;
        }
        
        html += `</div>`;
    }
    
    html += '</div>';
    return html;
}

// 単発ターン瀕死率表示HTML生成
function generateSingleTurnKORateHTML(koRates, moveAccuracy, evasionRankText = '') {
    if (!koRates || !koRates.basic) return '';
    
    const defenderItem = defenderPokemon.item;
    const hasItemEffect = defenderItem && (
        defenderItem.name === 'たべのこし' || 
        defenderItem.name === 'オボンのみ' ||
        defenderItem.name === 'くろいヘドロ' ||
        isFigyBerry(defenderItem.name)
    );
    
    let html = '<div class="ko-rate-section"><h4>瀕死率詳細</h4>';
    
    // 計算条件の説明
    html += '<div class="calculation-conditions" style="text-align: center; margin-bottom: 10px; font-size: 11px; color: #666;">';
    html += '急所率1/16を考慮';
    if (evasionRankText) {
        html += evasionRankText;
    }
    html += '</div>';
    
    // アイテム情報の表示
    if (hasItemEffect) {
        html += `<div class="item-info" style="text-align: center; margin-bottom: 10px; font-size: 12px; color: #666;">
            持ち物: ${defenderItem.name}
        </div>`;
    }
    
    // 天候情報の表示（雨天時のかみなりの場合）
    const weather = document.getElementById('weatherSelect').value;
    const hasWeatherEffect = weather === 'rain' && currentMove.name === 'かみなり';
    if (hasWeatherEffect) {
        html += `<div class="weather-info" style="text-align: center; margin-bottom: 10px; font-size: 12px; color: #17a2b8;">
            天候: あめ（かみなり必中）
        </div>`;
    }
    
    // はりきり情報の表示
    const hasHarikiri = document.getElementById('harikiriCheck')?.checked;
    if (hasHarikiri) {
        html += `<div class="ability-info" style="text-align: center; margin-bottom: 10px; font-size: 12px; color: #dc3545;">
            特性: はりきり（命中率0.8倍）
        </div>`;
    }
    
    // 瀕死率の表示
    const basicRate = koRates.basic[0];
    const itemRate = koRates.withItems ? koRates.withItems[0] : null;
    
    // ★修正: 連続技の場合の表示を変更
    let moveNameWithDamage, considerationText;
    
    if (currentMove && currentMove.class === 'multi_hit') {
        // 連続技の場合：総ダメージ範囲を表示
        const attackerStats = calculateStats(attackerPokemon);
        const defenderStats = calculateStats(defenderPokemon);
        
        const isPhysical = currentMove.category === "Physical";
        const attackValue = isPhysical ? attackerStats.a : attackerStats.c;
        const defenseValue = isPhysical ? defenderStats.b : defenderStats.d;
        
        const atkRankElement = document.getElementById('attackerAtkRank');
        const defRankElement = document.getElementById('defenderDefRank');
        const atkRank = atkRankElement ? atkRankElement.value : '±0';
        const defRank = defRankElement ? defRankElement.value : '±0';
        
        const [singleMin, singleMax] = calculateDamage(
            attackValue, defenseValue, attackerPokemon.level,
            currentMove.power || 0, currentMove.category, currentMove.type,
            attackerPokemon.types, defenderPokemon.types, atkRank, defRank
        );
        
        // ★修正: 1発分のダメージを表示（総ダメージではなく）
        moveNameWithDamage = `${currentMove.name} (ダメージ:${singleMin}~${singleMax})`;
        considerationText = '連続技各回数の発生確率と外れ時の両方を考慮';
    } else {
        // 通常技の場合
        if (koRates.basis && koRates.basis[0]) {
            const damageRange = koRates.basis[0].damageRange;
            moveNameWithDamage = `${currentMove.name} (ダメージ:${damageRange})`;
        } else {
            moveNameWithDamage = currentMove.name;
        }
        considerationText = '命中時と外れ時の両方を考慮';
    }
    
    // 計算根拠を生成
    let basis = '';
    if (koRates.basis && koRates.basis[0]) {
        const b = koRates.basis[0];
        let acc = b.accuracy;
        
        // 特殊な命中率の説明を追加
        let accText = `命中${acc}%`;
        if (weather === 'rain' && currentMove.name === 'かみなり') {
            accText = '必中（雨天）';
        } else if (currentMove.accuracy === 0) {
            accText = '必中';
        } else if (hasHarikiri && currentMove.category === 'Physical') {
            accText += '（はりきり補正済）';
        }
        
        basis = `[${moveNameWithDamage}]<br>`;
        basis += `${considerationText}<br>`;
        basis += `×${accText}`;
    }
    
    html += `<div class="ko-rate-row">`;
    html += `<span class="ko-turn">1ターン:</span>`;
    html += `<div class="ko-basis">${basis}</div>`;
    
    // アイテム効果がある場合は、アイテム考慮の瀕死率を表示
    if (hasItemEffect && itemRate !== null) {
        html += `<span class="ko-basic">${itemRate.toFixed(1)}%</span>`;
    } else {
        html += `<span class="ko-basic">${basicRate.toFixed(1)}%</span>`;
    }
    
    html += `</div>`;
    html += '</div>';
    return html;
}

// 特定ターンの定数ダメージ名を取得
function getConstantDamageNames() {
    const names = [];
    
    // 状態異常ダメージ
    const statusType = document.getElementById('statusDamageSelect').value;
    if (statusType !== 'none') {
        const statusNames = {
            'burn': 'やけど',
            'poison': 'どく', 
            'badlypoison': 'もうどく'
        };
        if (statusNames[statusType]) {
            names.push(statusNames[statusType]);
        }
    }
    
    // まきびしダメージ
    const spikesLevel = parseInt(document.getElementById('spikesLevel').value) || 0;
    if (spikesLevel > 0) {
        names.push('まきびし');
    }
    
    // ★新規追加: のろいダメージ
    const curseSelect = document.getElementById('curseSelect');
    if (curseSelect && curseSelect.value !== 'none') {
        names.push('のろい');
    }
    
    // ★新規追加: あくむダメージ
    const nightmareSelect = document.getElementById('nightmareSelect');
    if (nightmareSelect && nightmareSelect.value !== 'none') {
        names.push('あくむ');
    }
    
    // ★新規追加: やどりぎダメージ
    const leechSeedSelect = document.getElementById('leechSeedSelect');
    if (leechSeedSelect && leechSeedSelect.value !== 'none') {
        names.push('やどりぎ');
    }
    
    // 天候ダメージ
    const weather = document.getElementById('weatherSelect').value;
    if (weather === 'sandstorm' || weather === 'hail') {
        const weatherNames = {
            'sandstorm': 'すなあらし',
            'hail': 'あられ'
        };
        if (weatherNames[weather]) {
            names.push(weatherNames[weather]);
        }
    }
    
    return names;
}

// 特定ターンのダメージ範囲を定数ダメージ込みで計算
function calculateDamageWithConstantForTurn(turnIndex, moveInfo) {
    if (!moveInfo) {
        return { min: 0, max: 0 };
    }
    
    // 元のダメージを計算
    const attackerStats = calculateStats(attackerPokemon);
    const defenderStats = calculateStats(defenderPokemon);
    
    const isPhysical = moveInfo.category === '物理';
    const attackValue = isPhysical ? attackerStats.a : attackerStats.c;
    const defenseValue = isPhysical ? defenderStats.b : defenderStats.d;
    
    const atkRankElement = document.getElementById('attackerAtkRank');
    const defRankElement = document.getElementById('defenderDefRank');
    const atkRank = atkRankElement ? atkRankElement.value : '±0';
    const defRank = defRankElement ? defRankElement.value : '±0';
    
    // 技のパワーを計算（特殊技の場合も考慮）
    const move = multiTurnMoves[turnIndex] || currentMove;
    const movePower = calculatePower(move);
    
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
    
    // 定数ダメージを計算
    const constantDamage = calculateTotalConstantDamage(defenderStats.hp, defenderPokemon.types, turnIndex + 1);
    
    return {
        min: baseDamageMin + constantDamage,
        max: baseDamageMax + constantDamage
    };
}

function getConstantDamageNamesForTurn(turnNumber) {
    const names = [];
    
    // 状態異常ダメージ（起点ターン対応）
    const statusType = document.getElementById('statusDamageSelect').value;
    const statusStartTurn = parseInt(document.getElementById('statusDamageStartTurn')?.value) || 1;
    if (statusType !== 'none' && turnNumber >= statusStartTurn) {
        const statusNames = {
            'burn': 'やけど',
            'poison': 'どく', 
            'badlypoison': 'もうどく'
        };
        if (statusNames[statusType]) {
            names.push(statusNames[statusType]);
        }
    }
    
    // まきびしダメージ（1ターン目のみ）
    const spikesLevel = parseInt(document.getElementById('spikesLevel').value) || 0;
    if (spikesLevel > 0 && turnNumber === 1) {
        names.push('まきびし');
    }
    
    // のろいダメージ（指定ターン以降）
    const curseSelect = document.getElementById('curseSelect');
    if (curseSelect) {
        const curseStartTurn = parseInt(curseSelect.value);
        if (!isNaN(curseStartTurn) && turnNumber >= curseStartTurn) {
            names.push('のろい');
        }
    }
    
    // あくむダメージ（指定ターン以降）
    const nightmareSelect = document.getElementById('nightmareSelect');
    if (nightmareSelect) {
        const nightmareStartTurn = parseInt(nightmareSelect.value);
        if (!isNaN(nightmareStartTurn) && turnNumber >= nightmareStartTurn) {
            names.push('あくむ');
        }
    }
    
    // やどりぎダメージ（指定ターン以降）
    const leechSeedSelect = document.getElementById('leechSeedSelect');
    if (leechSeedSelect) {
        const leechSeedStartTurn = parseInt(leechSeedSelect.value);
        if (!isNaN(leechSeedStartTurn) && turnNumber >= leechSeedStartTurn) {
            names.push('やどりぎ');
        }
    }
    
    // 天候ダメージ（全ターン）
    const weather = document.getElementById('weatherSelect').value;
    if (weather === 'sandstorm' || weather === 'hail') {
        const weatherNames = {
            'sandstorm': 'すなあらし',
            'hail': 'あられ'
        };
        if (weatherNames[weather]) {
            names.push(weatherNames[weather]);
        }
    }
    
    return names;
}

// 定数ダメージ名を取得するヘルパー関数
function getConstantDamageNames() {
    const names = [];
    
    // 状態異常ダメージ
    const statusType = document.getElementById('statusDamageSelect').value;
    if (statusType !== 'none') {
        const statusNames = {
            'burn': 'やけど',
            'poison': 'どく', 
            'badlypoison': 'もうどく'
        };
        if (statusNames[statusType]) {
            names.push(statusNames[statusType]);
        }
    }
    
    // まきびしダメージ
    const spikesLevel = parseInt(document.getElementById('spikesLevel').value) || 0;
    if (spikesLevel > 0) {
        names.push('まきびし');
    }
    
    // のろいダメージ
    const curseSelect = document.getElementById('curseSelect');
    if (curseSelect && curseSelect.value !== 'none') {
        names.push('のろい');
    }
    
    // あくむダメージ
    const nightmareSelect = document.getElementById('nightmareSelect');
    if (nightmareSelect && nightmareSelect.value !== 'none') {
        names.push('あくむ');
    }
    
    // やどりぎダメージ
    const leechSeedSelect = document.getElementById('leechSeedSelect');
    if (leechSeedSelect && leechSeedSelect.value !== 'none') {
        names.push('やどりぎ');
    }
    
    // 天候ダメージ
    const weather = document.getElementById('weatherSelect').value;
    if (weather === 'sandstorm' || weather === 'hail') {
        const weatherNames = {
            'sandstorm': 'すなあらし',
            'hail': 'あられ'
        };
        if (weatherNames[weather]) {
            names.push(weatherNames[weather]);
        }
    }
    
    return names;
}

// ========================
// 11. performDamageCalculation関数
// ========================

function performDamageCalculationEnhancedUnified() {
    // ツール情報非表示
    document.querySelector('.tool-info').style.display = 'none';
    // ポワルンのタイプを最新の天候に更新
    updateCastformTypeIfNeeded();

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
    
    // 定数ダメージの設定があるかチェック
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
    
    // 複数ターン表示が必要な条件
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
    
    // ★重要: 常に1発分のダメージを計算
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
    
    const minDamage = baseDamageMin;
    const maxDamage = baseDamageMax;
    
    // 統合版結果表示を呼び出し
    displayUnifiedResults(minDamage, maxDamage, defenderStats.hp, false, atkRank, defRank);
}


// 複数ターン技のドロップダウン設定
function setupMultiTurnMoveDropdown(inputId, turn) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    const dropdown = document.createElement('div');
    dropdown.className = 'pokemon-dropdown';
    dropdown.style.display = 'none';
    document.body.appendChild(dropdown);
    
    input.addEventListener('click', function(e) {
        e.stopPropagation();
        this.value = '';
        // クリック時にもクリア
        multiTurnMoves[turn] = null;
        showMoveListForTurn(dropdown, input, turn);
    });
    
    input.addEventListener('input', function() {
        // 入力中もリアルタイムでチェック
        if (this.value.trim() === '') {
            multiTurnMoves[turn] = null;
        }
        filterMoveListForTurn(this.value, dropdown, input, turn);
    });
    
    input.addEventListener('blur', function() {
        // フォーカスアウト時に確定
        setTimeout(() => {
            checkExactMoveMatchForTurn(this.value, turn);
        }, 200); // ドロップダウンクリック用の遅延
    });
    
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkExactMoveMatchForTurn(this.value, turn);
            dropdown.style.display = 'none';
        }
    });
    
    // 外部クリック時にドロップダウンを閉じる
    document.addEventListener('click', function(e) {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });
}

function showMoveListForTurn(dropdown, input, turn) {
   dropdown.innerHTML = '';
   
   const rect = input.getBoundingClientRect();
   dropdown.style.top = (rect.bottom + window.scrollY) + 'px';
   dropdown.style.left = (rect.left + window.scrollX) + 'px';
   dropdown.style.width = rect.width + 'px';
   
   const displayItems = moveData.slice(0, 30);
   
   displayItems.forEach(move => {
       const item = createDropdownItem(move.name, () => {
           input.value = move.name;
           dropdown.style.display = 'none';
           selectMultiTurnMove(turn, move.name);
       });
       dropdown.appendChild(item);
   });
   
   dropdown.style.display = 'block';
}

function filterMoveListForTurn(searchText, dropdown, input, turn) {
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
   
   const filtered = moveData.filter(move => {
       const name = move.name ? move.name.toLowerCase() : '';
       const hiragana = move.hiragana ? move.hiragana.toLowerCase() : '';
       const romaji = move.romaji ? move.romaji.toLowerCase() : '';
       
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
           selectMultiTurnMove(turn, move.name);
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
    if (!inputText) {
        selectPokemon(side, "");  // 空欄の場合はリセット
        return;
    }
    
    // カタカナ、ひらがな、ローマ字での完全一致を検索
    const exactMatch = allPokemonData.find(pokemon => {
        return pokemon.name === inputText ||
               pokemon.hiragana === inputText ||
               (pokemon.romaji && pokemon.romaji.toLowerCase() === inputText.toLowerCase());
    });
    
    if (exactMatch) {
        selectPokemon(side, exactMatch.name);
    } else {
        // 一致しない場合もリセット
        selectPokemon(side, "");
    }
}

// HTMLのボタンのonclick属性を更新するための関数
function updateDamageCalculationButton() {
   const button = document.querySelector('.damage-calc-button');
   if (button) {
       button.setAttribute('onclick', 'performDamageCalculationEnhanced()');
   }
}

// 複数ターン技設定のイベントリスナー設定
function setupMultiTurnMoveListeners() {
   // 2-4ターン目の技設定（インデックスは1-3）
   for (let i = 2; i <= 4; i++) {
       setupMultiTurnMoveDropdown(`multiTurnMove${i}`, i - 1);
   }
}
