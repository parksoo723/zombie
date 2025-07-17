class ZombieApocalypseGame {
    constructor() {
        this.gameState = {
            day: 1,
            health: 100,
            maxHealth: 100,
            energy: 100,
            maxEnergy: 100,
            food: 50,
            water: 50,
            zombiesKilled: 0,
            areasExplored: 0,
            isGameOver: false
        };
        
        this.inventory = {};
        this.equipment = {
            weapon: null,
            armor: null
        };
        
        this.locations = {
            residential: {
                name: '주거지역',
                icon: '🏠',
                dangerLevel: 'low',
                items: ['food', 'water', 'bandage', 'clothes'],
                zombieChance: 0.3
            },
            commercial: {
                name: '상업지역',
                icon: '🏪',
                dangerLevel: 'medium',
                items: ['medicine', 'tools', 'food', 'battery'],
                zombieChance: 0.5
            },
            industrial: {
                name: '공업지역',
                icon: '🏭',
                dangerLevel: 'high',
                items: ['weapon', 'materials', 'tools', 'fuel'],
                zombieChance: 0.7
            },
            hospital: {
                name: '병원',
                icon: '🏥',
                dangerLevel: 'extreme',
                items: ['medicine', 'syringe', 'antibiotics', 'surgical_kit'],
                zombieChance: 0.9
            }
        };
        
        this.items = {
            // 음식 & 물
            food: { name: '음식', icon: '🍞', type: 'consumable', effect: { food: 20 } },
            water: { name: '물', icon: '💧', type: 'consumable', effect: { water: 25 } },
            
            // 의료용품
            bandage: { name: '붕대', icon: '🩹', type: 'consumable', effect: { health: 15 } },
            medicine: { name: '약', icon: '💊', type: 'consumable', effect: { health: 30 } },
            antibiotics: { name: '항생제', icon: '💉', type: 'consumable', effect: { health: 50 } },
            
            // 무기
            knife: { name: '칼', icon: '🔪', type: 'weapon', damage: 15 },
            bat: { name: '야구방망이', icon: '⚾', type: 'weapon', damage: 20 },
            axe: { name: '도끼', icon: '🪓', type: 'weapon', damage: 30 },
            gun: { name: '권총', icon: '🔫', type: 'weapon', damage: 50 },
            
            // 방어구
            clothes: { name: '옷', icon: '👕', type: 'armor', defense: 5 },
            jacket: { name: '재킷', icon: '🧥', type: 'armor', defense: 10 },
            vest: { name: '방탄조끼', icon: '🦺', type: 'armor', defense: 25 },
            
            // 재료
            materials: { name: '재료', icon: '🔧', type: 'material' },
            tools: { name: '도구', icon: '🛠️', type: 'material' },
            battery: { name: '배터리', icon: '🔋', type: 'material' },
            fuel: { name: '연료', icon: '⛽', type: 'material' }
        };
        
        this.craftRecipes = {
            weapons: [
                {
                    id: 'knife',
                    name: '칼',
                    icon: '🔪',
                    materials: { materials: 2 },
                    description: '기본적인 근접 무기'
                },
                {
                    id: 'bat',
                    name: '야구방망이',
                    icon: '⚾',
                    materials: { materials: 3, tools: 1 },
                    description: '강력한 타격 무기'
                }
            ],
            tools: [
                {
                    id: 'first_aid',
                    name: '응급처치키트',
                    icon: '🏥',
                    materials: { bandage: 3, medicine: 1 },
                    description: '체력을 크게 회복'
                }
            ],
            medical: [
                {
                    id: 'medicine',
                    name: '약',
                    icon: '💊',
                    materials: { materials: 1 },
                    description: '체력 회복'
                }
            ],
            food: [
                {
                    id: 'cooked_food',
                    name: '조리된 음식',
                    icon: '🍖',
                    materials: { food: 2, fuel: 1 },
                    description: '더 많은 포만감 제공'
                }
            ]
        };
        
        this.currentCombat = null;
        this.gameTimer = null;
        
        this.init();
    }
    
    init() {
        this.updateUI();
        this.bindEvents();
        this.startGameTimer();
        this.generateMap();
        this.addLogEntry('게임이 시작되었습니다. 생존하세요!', 'welcome');
        
        // 초기 아이템 지급
        this.addItem('food', 3);
        this.addItem('water', 3);
        this.addItem('bandage', 2);
    }
    
    bindEvents() {
        // 액션 버튼들
        document.getElementById('exploreBtn').addEventListener('click', () => this.openExploreModal());
        document.getElementById('restBtn').addEventListener('click', () => this.rest());
        document.getElementById('craftBtn').addEventListener('click', () => this.openCraftModal());
        document.getElementById('inventoryBtn').addEventListener('click', () => this.toggleInventory());
        
        // 탐험 지역 선택
        document.querySelectorAll('.location-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const location = e.currentTarget.dataset.location;
                this.exploreLocation(location);
            });
        });
        
        // 전투 액션
        document.getElementById('attackBtn').addEventListener('click', () => this.combatAction('attack'));
        document.getElementById('defendBtn').addEventListener('click', () => this.combatAction('defend'));
        document.getElementById('runBtn').addEventListener('click', () => this.combatAction('run'));
        
        // 제작 탭
        document.querySelectorAll('.craft-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchCraftTab(e.target.dataset.category);
            });
        });
        
        // 로그 클리어
        document.getElementById('clearLogBtn').addEventListener('click', () => this.clearLog());
        
        // 게임 오버 버튼들
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('shareScoreBtn').addEventListener('click', () => this.shareScore());
        
        // 인벤토리 아이템 사용
        document.addEventListener('click', (e) => {
            if (e.target.closest('.inventory-slot')) {
                const slot = e.target.closest('.inventory-slot');
                const itemId = slot.dataset.item;
                if (itemId) {
                    this.useItem(itemId);
                }
            }
        });
        
        // 모달 외부 클릭시 닫기
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }
    
    startGameTimer() {
        this.gameTimer = setInterval(() => {
            this.gameState.energy = Math.max(0, this.gameState.energy - 1);
            this.gameState.food = Math.max(0, this.gameState.food - 0.5);
            this.gameState.water = Math.max(0, this.gameState.water - 0.8);
            
            // 굶주림과 갈증으로 인한 체력 감소
            if (this.gameState.food <= 0) {
                this.gameState.health = Math.max(0, this.gameState.health - 2);
                this.addLogEntry('굶주림으로 체력이 감소합니다!', 'danger');
            }
            
            if (this.gameState.water <= 0) {
                this.gameState.health = Math.max(0, this.gameState.health - 3);
                this.addLogEntry('갈증으로 체력이 감소합니다!', 'danger');
            }
            
            this.updateUI();
            this.checkGameOver();
        }, 5000); // 5초마다 업데이트
    }
    
    generateMap() {
        const mapGrid = document.querySelector('.map-grid');
        mapGrid.innerHTML = '';
        
        for (let i = 0; i < 60; i++) {
            const tile = document.createElement('div');
            tile.className = 'map-tile';
            
            // 랜덤하게 지역 타입 할당
            const rand = Math.random();
            if (rand < 0.1) {
                tile.textContent = '🏠';
                tile.dataset.location = 'residential';
            } else if (rand < 0.2) {
                tile.textContent = '🏪';
                tile.dataset.location = 'commercial';
            } else if (rand < 0.25) {
                tile.textContent = '🏭';
                tile.dataset.location = 'industrial';
            } else if (rand < 0.27) {
                tile.textContent = '🏥';
                tile.dataset.location = 'hospital';
            } else if (rand < 0.4) {
                tile.textContent = '🧟‍♂️';
                tile.classList.add('danger');
            }
            
            tile.addEventListener('click', () => {
                if (tile.dataset.location) {
                    this.exploreLocation(tile.dataset.location);
                }
            });
            
            mapGrid.appendChild(tile);
        }
    }
    
    updateUI() {
        // 스탯 업데이트
        document.getElementById('dayCount').textContent = this.gameState.day;
        document.getElementById('health').textContent = Math.floor(this.gameState.health);
        document.getElementById('energy').textContent = Math.floor(this.gameState.energy);
        document.getElementById('food').textContent = Math.floor(this.gameState.food);
        document.getElementById('water').textContent = Math.floor(this.gameState.water);
        
        // 인벤토리 업데이트
        this.updateInventoryDisplay();
        
        // 장비 업데이트
        this.updateEquipmentDisplay();
    }
    
    updateInventoryDisplay() {
        const inventoryGrid = document.getElementById('inventoryGrid');
        inventoryGrid.innerHTML = '';
        
        // 16개 슬롯 생성
        for (let i = 0; i < 16; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            inventoryGrid.appendChild(slot);
        }
        
        // 아이템 배치
        let slotIndex = 0;
        Object.entries(this.inventory).forEach(([itemId, count]) => {
            if (slotIndex < 16 && count > 0) {
                const slot = inventoryGrid.children[slotIndex];
                const item = this.items[itemId];
                
                slot.classList.add('has-item');
                slot.dataset.item = itemId;
                slot.innerHTML = `
                    <div class="item-icon">${item.icon}</div>
                    <div class="item-count">${count}</div>
                `;
                slot.title = item.name;
                
                slotIndex++;
            }
        });
    }
    
    updateEquipmentDisplay() {
        const weaponSlot = document.getElementById('equippedWeapon');
        const armorSlot = document.getElementById('equippedArmor');
        
        weaponSlot.textContent = this.equipment.weapon ? this.items[this.equipment.weapon].icon : '';
        armorSlot.textContent = this.equipment.armor ? this.items[this.equipment.armor].icon : '';
    }
    
    addItem(itemId, count = 1) {
        if (!this.inventory[itemId]) {
            this.inventory[itemId] = 0;
        }
        this.inventory[itemId] += count;
        this.updateInventoryDisplay();
    }
    
    removeItem(itemId, count = 1) {
        if (this.inventory[itemId]) {
            this.inventory[itemId] = Math.max(0, this.inventory[itemId] - count);
            if (this.inventory[itemId] === 0) {
                delete this.inventory[itemId];
            }
            this.updateInventoryDisplay();
            return true;
        }
        return false;
    }
    
    useItem(itemId) {
        const item = this.items[itemId];
        if (!item || !this.inventory[itemId]) return;
        
        if (item.type === 'consumable') {
            // 소모품 사용
            Object.entries(item.effect).forEach(([stat, value]) => {
                if (stat === 'health') {
                    this.gameState.health = Math.min(this.gameState.maxHealth, this.gameState.health + value);
                } else if (stat === 'food') {
                    this.gameState.food = Math.min(100, this.gameState.food + value);
                } else if (stat === 'water') {
                    this.gameState.water = Math.min(100, this.gameState.water + value);
                }
            });
            
            this.removeItem(itemId, 1);
            this.addLogEntry(`${item.name}을(를) 사용했습니다.`, 'success');
            
        } else if (item.type === 'weapon') {
            // 무기 장착
            if (this.equipment.weapon) {
                this.addItem(this.equipment.weapon, 1);
            }
            this.equipment.weapon = itemId;
            this.removeItem(itemId, 1);
            this.addLogEntry(`${item.name}을(를) 장착했습니다.`, 'success');
            
        } else if (item.type === 'armor') {
            // 방어구 장착
            if (this.equipment.armor) {
                this.addItem(this.equipment.armor, 1);
            }
            this.equipment.armor = itemId;
            this.removeItem(itemId, 1);
            this.addLogEntry(`${item.name}을(를) 착용했습니다.`, 'success');
        }
        
        this.updateUI();
    }
    
    openExploreModal() {
        if (this.gameState.energy < 20) {
            this.addLogEntry('에너지가 부족합니다. 휴식이 필요합니다.', 'danger');
            return;
        }
        document.getElementById('exploreModal').style.display = 'block';
    }
    
    exploreLocation(locationId) {
        const location = this.locations[locationId];
        if (!location) return;
        
        closeModal('exploreModal');
        
        // 에너지 소모
        this.gameState.energy = Math.max(0, this.gameState.energy - 20);
        this.gameState.areasExplored++;
        
        this.addLogEntry(`${location.name}을(를) 탐험합니다...`, 'info');
        
        // 좀비 조우 확인
        if (Math.random() < location.zombieChance) {
            this.startCombat();
        } else {
            this.findItems(location);
        }
        
        this.updateUI();
    }
    
    findItems(location) {
        const foundItems = [];
        const itemCount = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < itemCount; i++) {
            const randomItem = location.items[Math.floor(Math.random() * location.items.length)];
            const count = Math.floor(Math.random() * 3) + 1;
            
            this.addItem(randomItem, count);
            foundItems.push(`${this.items[randomItem].name} x${count}`);
        }
        
        this.addLogEntry(`아이템을 발견했습니다: ${foundItems.join(', ')}`, 'success');
    }
    
    startCombat() {
        const zombieTypes = [
            { name: '일반 좀비', health: 30, damage: 10, icon: '🧟‍♂️' },
            { name: '빠른 좀비', health: 20, damage: 15, icon: '🧟‍♀️' },
            { name: '강한 좀비', health: 50, damage: 20, icon: '🧟' }
        ];
        
        const zombie = zombieTypes[Math.floor(Math.random() * zombieTypes.length)];
        this.currentCombat = {
            zombie: { ...zombie, maxHealth: zombie.health },
            playerHealth: this.gameState.health,
            turn: 'player'
        };
        
        document.getElementById('zombieType').textContent = zombie.name;
        this.updateCombatUI();
        document.getElementById('combatModal').style.display = 'block';
        
        this.addCombatLog(`${zombie.name}과(와) 조우했습니다!`);
    }
    
    combatAction(action) {
        if (!this.currentCombat || this.currentCombat.turn !== 'player') return;
        
        const combat = this.currentCombat;
        let playerDamage = 0;
        
        switch (action) {
            case 'attack':
                playerDamage = this.calculatePlayerDamage();
                combat.zombie.health = Math.max(0, combat.zombie.health - playerDamage);
                this.addCombatLog(`${playerDamage}의 피해를 입혔습니다!`);
                break;
                
            case 'defend':
                this.addCombatLog('방어 자세를 취했습니다.');
                combat.defending = true;
                break;
                
            case 'run':
                if (Math.random() < 0.7) {
                    this.addCombatLog('성공적으로 도망쳤습니다!');
                    this.endCombat(false);
                    return;
                } else {
                    this.addCombatLog('도망치지 못했습니다!');
                }
                break;
        }
        
        // 좀비가 죽었는지 확인
        if (combat.zombie.health <= 0) {
            this.addCombatLog(`${combat.zombie.name}을(를) 처치했습니다!`);
            this.gameState.zombiesKilled++;
            this.endCombat(true);
            return;
        }
        
        // 좀비 턴
        combat.turn = 'zombie';
        setTimeout(() => this.zombieAttack(), 1000);
    }
    
    zombieAttack() {
        const combat = this.currentCombat;
        let zombieDamage = combat.zombie.damage;
        
        // 방어 중이면 피해 감소
        if (combat.defending) {
            zombieDamage = Math.floor(zombieDamage * 0.5);
            combat.defending = false;
        }
        
        // 방어구 효과
        if (this.equipment.armor) {
            const armor = this.items[this.equipment.armor];
            zombieDamage = Math.max(1, zombieDamage - armor.defense);
        }
        
        this.gameState.health = Math.max(0, this.gameState.health - zombieDamage);
        this.addCombatLog(`${zombieDamage}의 피해를 받았습니다!`);
        
        // 플레이어가 죽었는지 확인
        if (this.gameState.health <= 0) {
            this.addCombatLog('당신이 쓰러졌습니다...');
            this.endCombat(false);
            this.gameOver();
            return;
        }
        
        combat.turn = 'player';
        this.updateCombatUI();
    }
    
    calculatePlayerDamage() {
        let damage = 10; // 기본 피해
        
        if (this.equipment.weapon) {
            const weapon = this.items[this.equipment.weapon];
            damage = weapon.damage;
        }
        
        // 랜덤 요소 추가
        damage += Math.floor(Math.random() * 10) - 5;
        return Math.max(1, damage);
    }
    
    updateCombatUI() {
        const playerHealthPercent = (this.gameState.health / this.gameState.maxHealth) * 100;
        const zombieHealthPercent = (this.currentCombat.zombie.health / this.currentCombat.zombie.maxHealth) * 100;
        
        document.getElementById('playerHealthBar').style.width = `${playerHealthPercent}%`;
        document.getElementById('zombieHealthBar').style.width = `${zombieHealthPercent}%`;
    }
    
    addCombatLog(message) {
        const combatLog = document.getElementById('combatLog');
        const entry = document.createElement('div');
        entry.className = 'combat-log-entry';
        entry.textContent = message;
        combatLog.appendChild(entry);
        combatLog.scrollTop = combatLog.scrollHeight;
    }
    
    endCombat(victory) {
        if (victory) {
            // 승리 보상
            const rewards = ['food', 'water', 'materials'];
            const reward = rewards[Math.floor(Math.random() * rewards.length)];
            const count = Math.floor(Math.random() * 3) + 1;
            
            this.addItem(reward, count);
            this.addLogEntry(`전투에서 승리했습니다! ${this.items[reward].name} x${count}을(를) 획득했습니다.`, 'success');
        }
        
        setTimeout(() => {
            document.getElementById('combatModal').style.display = 'none';
            document.getElementById('combatLog').innerHTML = '';
        }, 2000);
        
        this.currentCombat = null;
        this.updateUI();
    }
    
    rest() {
        if (this.gameState.energy >= this.gameState.maxEnergy) {
            this.addLogEntry('이미 충분히 휴식을 취했습니다.', 'info');
            return;
        }
        
        this.gameState.energy = Math.min(this.gameState.maxEnergy, this.gameState.energy + 30);
        this.gameState.health = Math.min(this.gameState.maxHealth, this.gameState.health + 5);
        
        // 하루가 지나감
        this.gameState.day++;
        
        this.addLogEntry('휴식을 취했습니다. 에너지와 체력이 회복되었습니다.', 'success');
        this.updateUI();
    }
    
    openCraftModal() {
        this.updateCraftRecipes();
        document.getElementById('craftModal').style.display = 'block';
    }
    
    switchCraftTab(category) {
        document.querySelectorAll('.craft-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        this.updateCraftRecipes(category);
    }
    
    updateCraftRecipes(category = 'weapons') {
        const recipesContainer = document.getElementById('craftRecipes');
        const recipes = this.craftRecipes[category] || [];
        
        recipesContainer.innerHTML = recipes.map(recipe => {
            const canCraft = this.canCraftItem(recipe);
            const materialsText = Object.entries(recipe.materials)
                .map(([item, count]) => `${this.items[item].name} x${count}`)
                .join(', ');
            
            return `
                <div class="recipe-card ${canCraft ? 'craftable' : ''}" onclick="game.craftItem('${recipe.id}', '${category}')">
                    <div class="recipe-header">
                        <div class="recipe-icon">${recipe.icon}</div>
                        <div class="recipe-name">${recipe.name}</div>
                    </div>
                    <div class="recipe-materials">
                        필요 재료: ${materialsText}
                    </div>
                    <div class="recipe-description">${recipe.description}</div>
                </div>
            `;
        }).join('');
    }
    
    canCraftItem(recipe) {
        return Object.entries(recipe.materials).every(([item, count]) => {
            return this.inventory[item] && this.inventory[item] >= count;
        });
    }
    
    craftItem(itemId, category) {
        const recipe = this.craftRecipes[category].find(r => r.id === itemId);
        if (!recipe || !this.canCraftItem(recipe)) {
            this.addLogEntry('재료가 부족합니다.', 'danger');
            return;
        }
        
        // 재료 소모
        Object.entries(recipe.materials).forEach(([item, count]) => {
            this.removeItem(item, count);
        });
        
        // 아이템 생성
        this.addItem(itemId, 1);
        this.addLogEntry(`${recipe.name}을(를) 제작했습니다!`, 'success');
        
        this.updateCraftRecipes(category);
        this.updateUI();
    }
    
    toggleInventory() {
        // 인벤토리 패널 토글 (이미 사이드바에 표시되어 있음)
        this.addLogEntry('인벤토리를 확인하세요.', 'info');
    }
    
    addLogEntry(message, type = 'info') {
        const logContent = document.getElementById('logContent');
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        
        const time = new Date().toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        entry.innerHTML = `
            <span class="log-time">${time}</span>
            <span class="log-message">${message}</span>
        `;
        
        logContent.appendChild(entry);
        logContent.scrollTop = logContent.scrollHeight;
        
        // 로그 항목이 너무 많으면 오래된 것 제거
        if (logContent.children.length > 20) {
            logContent.removeChild(logContent.firstChild);
        }
    }
    
    clearLog() {
        document.getElementById('logContent').innerHTML = '';
        this.addLogEntry('로그가 초기화되었습니다.', 'info');
    }
    
    checkGameOver() {
        if (this.gameState.health <= 0 && !this.gameState.isGameOver) {
            this.gameOver();
        }
    }
    
    gameOver() {
        this.gameState.isGameOver = true;
        clearInterval(this.gameTimer);
        
        // 최종 스탯 표시
        document.getElementById('finalDays').textContent = this.gameState.day;
        document.getElementById('zombiesKilled').textContent = this.gameState.zombiesKilled;
        document.getElementById('areasExplored').textContent = this.gameState.areasExplored;
        
        document.getElementById('gameOverModal').style.display = 'block';
        this.addLogEntry('게임 오버! 당신의 생존 여정이 끝났습니다.', 'danger');
    }
    
    restartGame() {
        // 게임 상태 초기화
        this.gameState = {
            day: 1,
            health: 100,
            maxHealth: 100,
            energy: 100,
            maxEnergy: 100,
            food: 50,
            water: 50,
            zombiesKilled: 0,
            areasExplored: 0,
            isGameOver: false
        };
        
        this.inventory = {};
        this.equipment = { weapon: null, armor: null };
        this.currentCombat = null;
        
        // 모달 닫기
        document.getElementById('gameOverModal').style.display = 'none';
        
        // 로그 초기화
        document.getElementById('logContent').innerHTML = '';
        
        // 게임 재시작
        this.init();
    }
    
    shareScore() {
        const score = this.gameState.day * 100 + this.gameState.zombiesKilled * 50 + this.gameState.areasExplored * 25;
        const text = `좀비 아포칼립스에서 ${this.gameState.day}일 동안 생존했습니다! 좀비 ${this.gameState.zombiesKilled}마리 처치, ${this.gameState.areasExplored}개 지역 탐험. 점수: ${score}점`;
        
        if (navigator.share) {
            navigator.share({
                title: '좀비 아포칼립스 생존 기록',
                text: text,
                url: window.location.href
            });
        } else {
            // 클립보드에 복사
            navigator.clipboard.writeText(text).then(() => {
                alert('점수가 클립보드에 복사되었습니다!');
            });
        }
    }
}

// 모달 닫기 함수
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// 게임 인스턴스 생성
let game;

document.addEventListener('DOMContentLoaded', () => {
    game = new ZombieApocalypseGame();
});