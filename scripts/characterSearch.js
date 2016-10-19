var searchButton = document.getElementById("searchButton");
var searchName = document.getElementById("searchName");

var characterDataTable = document.getElementById("characterDataTable");
var tabTableTr = document.getElementById("tabTableTr");

var searchMode = 0;

searchButton.addEventListener("click", DoSearch, false);
document.getElementById("characterSearchButton").addEventListener("click", function() {
    ShowTab(["search"]);
    searchMode = 0;
});
document.getElementById("systemButton").addEventListener("click", function() {
    ShowTab(["system"]);
});
document.getElementById("versionButton").addEventListener("click", function() {
    ShowTab(["version"]);
});

function ShowTab(tabNames) {
    var divs = document.getElementsByClassName("body");
    for(var i=0 ; i<divs.length ; i++) {
        divs[i].style.display = "none";
    }
    
    for (var tab in tabNames) {
        document.getElementById(tabNames[tab] + "Tab").style.display = "block";        
    }
}

function NullableNumber(n) {
    if (typeof(n) == "undefined" || n == null) {
        return 0;
    } else {
        return n;
    }
}

function NullableString(s) {
    if (typeof(s) == "undefined" || s == null) {
        return "";
    } else {
        return s;
    }
}

function SkillDetailText(cellToWrite, skillType, skillParams, skillFlag, iParams, popup) {
    var outputString = "";

    outputString += SkillFormat(skillType, skillParams, skillFlag, iParams);
    cellToWrite.innerHTML = outputString;
    
    cellToWrite.addEventListener("mouseover", function(e) {
        popup.style.display = "block";
        
        popup.getElementsByTagName("p")[0].innerHTML = "類別: " + SkillDatas[skillType].typeName;
        var paramDescriptions = SkillDatas[skillType].parameterDescription;
        for (var i=0 ; i<5; i++) {
            for (var j=0 ; j<2 ; j++) {
                popup.getElementsByTagName("table")[0].getElementsByTagName("tr")[i].getElementsByTagName("td")[j].innerHTML = paramDescriptions[i*2+j] + ": " + skillParams[i*2+j];
            }
        }
        var flagDescriptions = SkillDatas[skillType].flagDescription;
        for (var i=0 ; i<1; i++) {
            for (var j=0 ; j<2 ; j++) {
                popup.getElementsByTagName("table")[1].getElementsByTagName("tr")[i].getElementsByTagName("td")[j].innerHTML = flagDescriptions[i*2+j] + ": " + skillFlag[i*2+j];
            }
        }
        var iParamDescriptions = SkillDatas[skillType].iParameterDescription;
        for (var i=0 ; i<1; i++) {
            for (var j=0 ; j<2 ; j++) {
                popup.getElementsByTagName("table")[2].getElementsByTagName("tr")[i].getElementsByTagName("td")[j].innerHTML = iParamDescriptions[i*2+j] + ": " + iParams[i*2+j];
            }
        }
        
        var clientWidth = GetClientWidth();
        var clientHeight = GetClientHeight();
        var height = popup.clientHeight;
        var width = popup.clientWidth;
        var xOffset = e.pageX + width + 5 <= clientWidth ? 5 : -width-5;
        var yOffset = e.pageY + height + 5 <= clientHeight ? 5 : -height-5;
        popup.style.left = (e.pageX+xOffset) + "px";
        popup.style.top = (e.pageY+yOffset) + "px";
    });
    cellToWrite.addEventListener("mousemove", function(e) {
        var clientWidth = GetClientWidth();
        var clientHeight = GetClientHeight();
        var height = popup.clientHeight;
        var width = popup.clientWidth;
        var xOffset = e.pageX + width + 5 <= clientWidth ? 5 : -width-5;
        var yOffset = e.pageY + height + 5 <= clientHeight ? 5 : -height-5;
        popup.style.left = (e.pageX+xOffset) + "px";
        popup.style.top = (e.pageY+yOffset) + "px";
    });
    cellToWrite.addEventListener("mouseout", function(e){
        popup.style.display = "none";        
    });    
}

var characterData = {};
var characterDataReaded = {};
var characterDataShouldRead = [
    "character",
    "partner",
    "ability1",
    "ability2",
    "ability3",
    "ability4",
    "command",
    "skillBase0",
    "skillBase1",
    "skillBase2",
    "skillBase3",
    "skillBase4",
    "skillBase5",
    "skillBase6",
    "skillUpgrade0",
    "skillUpgrade1",
    "skillUpgrade2",
    "skillUpgrade3",
    "skillUpgrade4",
    "skillUpgrade5",
    "skillUpgrade6",
    "skill01",
    "skill02",
    "skill03",
    "skill04",
    "skill11",
    "skill12",
    "skill13",
    "skill14",
    "skill21",
    "skill22",
    "skill23",
    "skill24",
    "skill31",
    "skill32",
    "skill33",
    "skill34",
    "skill41",
    "skill42",
    "skill43",
    "skill44",
    "skill51",
    "skill52",
    "skill53",
    "skill54",
    "skill61",
    "skill62",
    "skill63",
    "skill64",
    "skillAtk01",
    "skillAtk02",
    "skillAtk03",
    "skillAtk04",
    "skillAtk11",
    "skillAtk12",
    "skillAtk13",
    "skillAtk14",
    "skillAtk21",
    "skillAtk22",
    "skillAtk23",
    "skillAtk24",
    "skillAtk31",
    "skillAtk32",
    "skillAtk33",
    "skillAtk34",
    "skillAtk41",
    "skillAtk42",
    "skillAtk43",
    "skillAtk44",
    "skillAtk51",
    "skillAtk52",
    "skillAtk53",
    "skillAtk54",
    "skillAtk61",
    "skillAtk62",
    "skillAtk63",
    "skillAtk64",
    "ultimate",
    "ultimateAtk",
];

function AddDeployEvent(th, dataKey) {
    th.dataKey = dataKey;
    th.addEventListener("click", function(e){
        DeployData(dataKey);
    });    
}

function DoSearch() {
    searchButton.disabled = true;
    document.getElementById("characterSearchTab").style.display = "none";
    characterData = {};
    characterDataReaded = {};
    
    currentDB.database().goOnline();
    currentDB.database().ref('/unit').orderByChild("name").equalTo(searchName.value).once('value').then(function(dataSnapshot) {
        var charactersData = dataSnapshot.val();
        
        if (IsNull(charactersData)) {
            NoCharacter();
        } else {
            tabTableTr.innerHTML = "";
            for (var dataKey in charactersData) {
                characterData[dataKey] = {};
                characterDataReaded[dataKey] = {};
            }
            for (var dataKey in charactersData) {
                characterData[dataKey].character = charactersData[dataKey];
                characterDataReaded[dataKey].character = true;
                
                if (Object.keys(charactersData).length > 1) {
                    var th = tabTableTr.appendChild(document.createElement("th"));
                    th.innerHTML = characterData[dataKey].character.nickname;
                    AddDeployEvent(th, dataKey);
                }
                
                ReadRelationData(dataKey, characterData[dataKey].character.partner_id);
                
                characterData[dataKey].ability = {};
                ReadAbilityData(dataKey, characterData[dataKey].character.ability01, 1)
                ReadAbilityData(dataKey, characterData[dataKey].character.ability02, 2)
                ReadAbilityData(dataKey, characterData[dataKey].character.ability03, 3)
                ReadAbilityData(dataKey, characterData[dataKey].character.ability04, 4)
                
                ReadCommandData(dataKey, characterData[dataKey].character.id);
                
                ReadUltimateData(dataKey, characterData[dataKey].character.ougi_id);
            }
        }
    });
}

function ReadRelationData(dataKey, partnerID) {
    currentDB.database().ref("/unit/" + partnerID).once("value").then(function(dataSnapshot) {
        var data = dataSnapshot.val();
        
        characterData[dataKey].partner = data;
        characterDataReaded[dataKey].partner = true;
        if (CheckDataReaded()) {
            DeployData(null);
        }
    });
}

function ReadAbilityData(dataKey, abilityID, abilityNum) {
    currentDB.database().ref("/ability/" + abilityID).once("value").then(function(dataSnapshot) {
        var data = dataSnapshot.val();
        
        characterData[dataKey].ability[abilityNum] = data;
        characterDataReaded[dataKey]["ability" + abilityNum] = true;
        if (CheckDataReaded()) {
            DeployData(null);
        }
    });
}

function ReadCommandData(dataKey, characterID) {
       currentDB.database().ref("/unit_command/" + characterID).once("value").then(function(dataSnapshot) {
        var data = dataSnapshot.val();
        
        characterData[dataKey].command = data;
        characterDataReaded[dataKey]["command"] = true;
        if (CheckDataReaded()) {
            DeployData(null);
        }
        
        characterData[dataKey].skillBase = {};
        characterData[dataKey].skillUpgrade = {};
        characterData[dataKey].skill = {};
        characterData[dataKey].skillAtk = {};
        for(var key in characterData[dataKey].command) {
            ReadSkillBase(dataKey, characterData[dataKey].command[key].skill_id, characterData[dataKey].command[key].index);            
            ReadSkillUpgrade(dataKey, characterData[dataKey].command[key].skill_id, characterData[dataKey].command[key].index);
        }
    }); 
}

function ReadSkillBase(dataKey, skillID, skillNum) {
    currentDB.database().ref("/skill_base/" + skillID).once("value").then(function(dataSnapshot) {
        var data = dataSnapshot.val();
        
        characterData[dataKey].skillBase[skillNum] = data;
        characterDataReaded[dataKey]["skillBase" + skillNum] = true;
        if (CheckDataReaded()) {
            DeployData(null);
        }
    });
}

function ReadSkillUpgrade(dataKey, skillID, skillNum) {
    currentDB.database().ref("/skill_upgrade/" + skillID).once("value").then(function(dataSnapshot) {
        var data = dataSnapshot.val();
        
        characterData[dataKey].skillUpgrade[skillNum] = data;
        characterDataReaded[dataKey]["skillUpgrade" + skillNum] = true;
        if (CheckDataReaded()) {
            DeployData(null);
        }
        
        characterData[dataKey].skill[skillNum] = {};
        characterData[dataKey].skillAtk[skillNum] = {};
        for (var key in characterData[dataKey].skillUpgrade[skillNum]) {
            ReadSkill(dataKey, characterData[dataKey].skillUpgrade[skillNum][key].skill_evolve, skillNum, characterData[dataKey].skillUpgrade[skillNum][key].rank);
            ReadSkillAtk(dataKey, characterData[dataKey].skillUpgrade[skillNum][key].skill_evolve, skillNum, characterData[dataKey].skillUpgrade[skillNum][key].rank);
        }
    });
}

function ReadSkill(dataKey, skillUpgradeID, skillNum, skillUpgradeNum) {
    currentDB.database().ref("/skill/" + skillUpgradeID).once("value").then(function(dataSnapshot) {
        var data = dataSnapshot.val();
        
        characterData[dataKey].skill[skillNum][skillUpgradeNum] = data;
        characterDataReaded[dataKey][("skill" + skillNum) + skillUpgradeNum] = true;
        if (CheckDataReaded()) {
            DeployData(null);
        }
    });
}

function ReadSkillAtk(dataKey, skillUpgradeID, skillNum, skillUpgradeNum) {
    currentDB.database().ref("/skill_atk/" + skillUpgradeID).once("value").then(function(dataSnapshot) {
        var data = dataSnapshot.val();
        
        characterData[dataKey].skillAtk[skillNum][skillUpgradeNum] = data;
        characterDataReaded[dataKey][("skillAtk" + skillNum) + skillUpgradeNum] = true;
        if (CheckDataReaded()) {
            DeployData(null);
        }
    });
}

function ReadUltimateData(dataKey, ultimateID) {
    currentDB.database().ref("/ougi/" + ultimateID).once("value").then(function(dataSnapshot) {
        var data = dataSnapshot.val();
        
        characterData[dataKey].ultimate = data;
        characterDataReaded[dataKey]["ultimate"] = true;
        if (CheckDataReaded()) {
            DeployData(null);
        }
    }); 
    currentDB.database().ref("/ougi_atk/" + ultimateID).once("value").then(function(dataSnapshot) {
        var data = dataSnapshot.val();
        
        characterData[dataKey].ultimateAtk = data;
        characterDataReaded[dataKey]["ultimateAtk"] = true;
        if (CheckDataReaded()) {
            DeployData(null);
        }
    }); 
}

function CheckDataReaded() {
    for (var dataKey in characterDataReaded) {
        for (var key in characterDataShouldRead) {
            if (IsNull(characterDataReaded[dataKey][characterDataShouldRead[key]])) {
                return false;
            }
        }
    }
    return true;
}

var statusGrowParameter = [
    [1, 29, 1],
    [30, 49, 1.02],
    [50, 79, 1.04],
    [80, 99, 1.06],
    [100, 149, 1.08],
    [150, 199, 1.1],
];

function CalculateStat(base, grow, level) {
    var ret = base;
    for(var key in statusGrowParameter) {
        if (level < statusGrowParameter[key][0]) {
            break;
        }
        
        var growLevel = statusGrowParameter[key][1] >= level ? level - statusGrowParameter[key][0] : statusGrowParameter[key][1] - statusGrowParameter[key][0] + 1;
        ret += growLevel * parseInt(grow * statusGrowParameter[key][2]);
    }
    return ret;
}

function DeployData(dataKey) {
    if (IsNull(dataKey)) {
        for (var key in characterData) {
            dataKey = key;
            break;
        }
    }
    
    for (var th in tabTableTr.childNodes) {
        if (tabTableTr.childNodes[th].dataKey == dataKey) {
            tabTableTr.childNodes[th].className = "selected";
        } else {
            tabTableTr.childNodes[th].className = "notselected";                
        }
    }
    
    document.getElementById("characterName").innerHTML = "";
    if (characterData[dataKey].character.nickname != "") {
        document.getElementById("characterName").innerHTML = characterData[dataKey].character.nickname + "<br>";
    }
    document.getElementById("characterName").innerHTML += characterData[dataKey].character.name;
    
    document.getElementById("characterRarity").innerHTML = characterData[dataKey].character.rarity;
    document.getElementById("characterElement").innerHTML = ElementType[characterData[dataKey].character.use_element];
    document.getElementById("characterJob").innerHTML = JobType[characterData[dataKey].character.job_id-1];
    
    document.getElementById("characterMaxStamina").innerHTML = CalculateStat(characterData[dataKey].character.hp, characterData[dataKey].character.hp_grow, 200);
    document.getElementById("characterMaxAttack").innerHTML = CalculateStat(characterData[dataKey].character.atk, characterData[dataKey].character.atk_grow, 200);
    document.getElementById("characterMaxSpeed").innerHTML = characterData[dataKey].character.agi;
    document.getElementById("characterMaxKnockback").innerHTML = CalculateStat(characterData[dataKey].character.knock_back_regist, characterData[dataKey].character.knock_back_grow, 200);
    
    document.getElementById("characterPartner").innerHTML = "";
    if (!IsNull(characterData[dataKey].partner)) {
        if (characterData[dataKey].partner.nickname != "") {
            document.getElementById("characterPartner").innerHTML = characterData[dataKey].partner.nickname + "<br>";
        }
        document.getElementById("characterPartner").innerHTML += characterData[dataKey].partner.name;
    }

    for (var i=1 ; i<=4 ; i++) {
        if (IsNull(characterData[dataKey].ability[i])) {
            document.getElementById("characterAbility" + i).innerHTML = "";
        } else {
            document.getElementById("characterAbility" + i).innerHTML = "<b>" + characterData[dataKey].ability[i].name.replace("\n", "") + "</b><br>";
            document.getElementById("characterAbility" + i).innerHTML += characterData[dataKey].ability[i].comment.replace("\\n", "");
        }
    }

    for (var i=1 ; i<=4 ; i++) {
        document.getElementById("characterTrait" + i).innerHTML = characterData[dataKey].character["Characteristic" + i];
    }

    for (var i=0 ; i<7 ; i++) {
        for (var j=1 ; j<=4 ; j++) {
            var cell;
            if (i < 3) {
                var cell = document.getElementById("characterAttack" + (i+1) + "level" + j);
            } else {
                var cell = document.getElementById("characterSkill" + (i-2) + "level" + j);
            }
            cell.innerHTML = "";
            cell.innerHTML += "<b>" + characterData[dataKey].skill[i][j].name + "</b>";
            if (i >= 3) {
                cell.innerHTML += " CD: " + (characterData[dataKey].skillBase[i].cd / 30).round(3);                
            }
            cell.innerHTML += "<br>";
            
            var totalValue = cell.appendChild(document.createElement("div"));
            { // damage
                totalValue.innerHTML = "總倍率: ";
                var baseDamageNum = characterData[dataKey].skillBase[i].dmg;
                var upgradeDamageNum = 1;
                for (var k=1 ; k<=3 ; k++) {
                    if (characterData[dataKey].skillUpgrade[i][j]["upgrade_type" + k] == 1) {
                        upgradeDamageNum *= (characterData[dataKey].skillUpgrade[i][j]["upgrade_value" + k]/100);
                    }
                }
                var hitDamageNum = 0;
                for (var key in characterData[dataKey].skillAtk[i][j]) {
                    hitDamageNum += (characterData[dataKey].skillAtk[i][j][key].dmg/100);
                }
                var chargeDamageNum = 0;
                for (var key in characterData[dataKey].skillAtk[i][j]) {
                    var chargeDamage = (characterData[dataKey].skillAtk[i][j][key].dmg/100);
                    for (var k=1 ; k<=3 ; k++) {
                        if (characterData[dataKey].skillAtk[i][j][key]["hold_type" + k] == 1) {
                            chargeDamage *= (characterData[dataKey].skillAtk[i][j][key]["hold_value" + k]/100);
                        }
                    }
                    chargeDamageNum += chargeDamage;
                }
                totalValue.innerHTML += (baseDamageNum * upgradeDamageNum * hitDamageNum).round(5);
                if (chargeDamageNum != hitDamageNum) {
                    totalValue.innerHTML += "/" + (baseDamageNum * upgradeDamageNum * chargeDamageNum).round(5);
                }
                totalValue.innerHTML += "  ";
            }
            
            { // break
                totalValue.innerHTML += "總破甲:";
                var baseBreakNum = characterData[dataKey].skillBase[i].break_;
                var upgradeBreakNum = 1;
                for (var k=1 ; k<=3 ; k++) {
                    if (characterData[dataKey].skillUpgrade[i][j]["upgrade_type" + k] == 7) {
                        upgradeBreakNum *= (characterData[dataKey].skillUpgrade[i][j]["upgrade_value" + k]/100);
                    }
                }
                var hitBreakNum = 0;
                for (var key in characterData[dataKey].skillAtk[i][j]) {
                    hitBreakNum += (characterData[dataKey].skillAtk[i][j][key].break_/100);
                }
                var chargeBreakNum = 0;
                for (var key in characterData[dataKey].skillAtk[i][j]) {
                    var chargeBreak = (characterData[dataKey].skillAtk[i][j][key].break_/100);
                    for (var k=1 ; k<=3 ; k++) {
                        if (characterData[dataKey].skillAtk[i][j][key]["hold_type" + k] == 12) {
                            chargeBreak *= (characterData[dataKey].skillAtk[i][j][key]["hold_value" + k]/100);
                        }
                    }
                    chargeBreakNum += chargeBreak;
                }
                totalValue.innerHTML += (baseBreakNum * upgradeBreakNum * hitBreakNum).round(5);
                if (chargeBreakNum != hitBreakNum) {
                    totalValue.innerHTML += "/" + (baseBreakNum * upgradeBreakNum * chargeBreakNum).round(5);
                }
                totalValue.innerHTML += "  ";
            }
            
            { // gravity
                totalValue.innerHTML += "總重力:";
                var baseGravityNum = 1;
                var upgradeGravityNum = 1;
                for (var k=1 ; k<=3 ; k++) {
                    if (characterData[dataKey].skillUpgrade[i][j]["upgrade_type" + k] == 6) {
                        upgradeGravityNum *= (characterData[dataKey].skillUpgrade[i][j]["upgrade_value" + k]/100);
                    }
                }
                var hitGravityNum = 0;
                for (var key in characterData[dataKey].skillAtk[i][j]) {
                    hitGravityNum += (characterData[dataKey].skillAtk[i][j][key].gravity);
                }
                var chargeGravityNum = 0;
                for (var key in characterData[dataKey].skillAtk[i][j]) {
                    var chargeGravity = (characterData[dataKey].skillAtk[i][j][key].gravity);
                    for (var k=1 ; k<=3 ; k++) {
                        if (characterData[dataKey].skillAtk[i][j][key]["hold_type" + k] == 6) {
                            chargeGravity *= (characterData[dataKey].skillAtk[i][j][key]["hold_value" + k]/100);
                        }
                    }
                    chargeGravityNum += chargeGravity;
                }
                totalValue.innerHTML += (baseGravityNum * upgradeGravityNum * hitGravityNum).round(5);
                if (chargeGravityNum != hitGravityNum) {
                    totalValue.innerHTML += "/" + (baseGravityNum * upgradeGravityNum * chargeGravityNum).round(5);
                }
                totalValue.innerHTML += "  ";
            }
            
            { // debuff
                var debuffType = 0;
                for (var key in characterData[dataKey].skillAtk[i][j]) {
                    if (characterData[dataKey].skillAtk[i][j][key].debuff != 0) { 
                        debuffType = characterData[dataKey].skillAtk[i][j][key].debuff;
                        break;
                    }
                }
                
                if (debuffType != 0) {
                    totalValue.innerHTML += "總" + DebuffType[debuffType] + ": ";
                    var baseDebuffNum = 1;
                    var upgradeDebuffNum = 1;
                    for (var k=1 ; k<=3 ; k++) {
                        if (characterData[dataKey].skillUpgrade[i][j]["upgrade_type" + k] == 5) {
                            upgradeDebuffNum *= (characterData[dataKey].skillUpgrade[i][j]["upgrade_value" + k]/100);
                        }
                    }
                    var hitDebuffNum = 0;
                    for (var key in characterData[dataKey].skillAtk[i][j]) {
                        hitDebuffNum += (characterData[dataKey].skillAtk[i][j][key].debuff_value);
                    }
                    var chargeDebuffNum = 0;
                    for (var key in characterData[dataKey].skillAtk[i][j]) {
                        var chargeDebuff = (characterData[dataKey].skillAtk[i][j][key].debuff_value);
                        for (var k=1 ; k<=3 ; k++) {
                            if (characterData[dataKey].skillAtk[i][j][key]["hold_type" + k] == 4) {
                                chargeDebuff *= (characterData[dataKey].skillAtk[i][j][key]["hold_value" + k]/100);
                            }
                        }
                        chargeDebuffNum += chargeDebuff;
                    }
                    totalValue.innerHTML += (baseDebuffNum * upgradeDebuffNum * hitDebuffNum).round(5);
                    if (chargeDebuffNum != hitDebuffNum) {
                        totalValue.innerHTML += "/" + (baseDebuffNum * upgradeDebuffNum * chargeDebuffNum).round(5);
                    }
                    totalValue.innerHTML += "  ";
                }
            }
            
            var detailTable = cell.appendChild(document.createElement("table"));
            detailTable.className = "detailTable";
            var detailTableHeader = detailTable.appendChild(document.createElement("tr"));
            var detailTableRow = detailTable.appendChild(document.createElement("tr"));
            for (var key in characterData[dataKey].skillAtk[i][j]) {
                var header = detailTableHeader.appendChild(document.createElement("th"));
                header.innerHTML = "第" + key + "擊";
                
                var body = detailTableRow.appendChild(document.createElement("td"));
                
                { // damage
                    body.innerHTML = "倍率: ";
                    var damageNum = characterData[dataKey].skillBase[i].dmg;
                    for (var k=1 ; k<=3 ; k++) {
                        if (characterData[dataKey].skillUpgrade[i][j]["upgrade_type" + k] == 1) {
                            damageNum *= (characterData[dataKey].skillUpgrade[i][j]["upgrade_value" + k]/100);
                        }
                    }
                    damageNum *= (characterData[dataKey].skillAtk[i][j][key].dmg/100);
                    var chargeDamageNum = 1;
                    for (var k=1 ; k<=3 ; k++) {
                        if (characterData[dataKey].skillAtk[i][j][key]["hold_type" + k] == 1) {
                            chargeDamage *= (characterData[dataKey].skillAtk[i][j][key]["hold_value" + k]/100);
                        }
                    }
                    body.innerHTML += damageNum.round(5);
                    if (chargeDamageNum != 1) {
                        body.innerHTML += "/" + (damageNum*chargeDamageNum).round(5);
                    }
                    body.innerHTML += "<br>";
                }
                
                { //break
                    body.innerHTML += "破甲: ";
                    var breakNum = characterData[dataKey].skillBase[i].break_;
                    for (var k=1 ; k<=3 ; k++) {
                        if (characterData[dataKey].skillUpgrade[i][j]["upgrade_type" + k] == 7) {
                            breakNum *= (characterData[dataKey].skillUpgrade[i][j]["upgrade_value" + k]/100);
                        }
                    }
                    breakNum *= (characterData[dataKey].skillAtk[i][j][key].break_/100);
                    var chargeBreakNum = 1;
                    for (var k=1 ; k<=3 ; k++) {
                        if (characterData[dataKey].skillAtk[i][j][key]["hold_type" + k] == 12) {
                            chargeBreak *= (characterData[dataKey].skillAtk[i][j][key]["hold_value" + k]/100);
                        }
                    }
                    body.innerHTML += breakNum.round(5);
                    if (chargeBreakNum != 1) {
                        body.innerHTML += "/" + (breakNum*chargeBreakNum).round(5);
                    }
                    body.innerHTML += "<br>";
                }
                
                { // gravity
                    body.innerHTML += "重力: ";
                    var gravityNum = 1;
                    for (var k=1 ; k<=3 ; k++) {
                        if (characterData[dataKey].skillUpgrade[i][j]["upgrade_type" + k] == 6) {
                            gravityNum *= (characterData[dataKey].skillUpgrade[i][j]["upgrade_value" + k]/100);
                        }
                    }
                    gravityNum *= characterData[dataKey].skillAtk[i][j][key].gravity;
                    var chargeGravityNum = 1;
                    for (var k=1 ; k<=3 ; k++) {
                        if (characterData[dataKey].skillAtk[i][j][key]["hold_type" + k] == 6) {
                            chargeGravity *= (characterData[dataKey].skillAtk[i][j][key]["hold_value" + k]/100);
                        }
                    }
                    body.innerHTML += gravityNum.round(5);
                    if (chargeGravityNum != 1) {
                        body.innerHTML += "/" + (gravityNum*chargeGravityNum).round(5);
                    }
                    body.innerHTML += "<br>";
                }
                
                if (characterData[dataKey].skillAtk[i][j][key].debuff != 0) {
                    body.innerHTML += DebuffType[characterData[dataKey].skillAtk[i][j][key].debuff] + ": ";
                    var debuffNum = 1;
                    for (var k=1 ; k<=3 ; k++) {
                        if (characterData[dataKey].skillUpgrade[i][j]["upgrade_type" + k] == 5) {
                            debuffNum *= (characterData[dataKey].skillUpgrade[i][j]["upgrade_value" + k]/100);
                        }
                    }
                    debuffNum *= characterData[dataKey].skillAtk[i][j][key].debuff_value;
                    var chargeDebuffNum = 1;
                    for (var k=1 ; k<=3 ; k++) {
                        if (characterData[dataKey].skillAtk[i][j][key]["hold_type" + k] == 4) {
                            chargeDebuff *= (characterData[dataKey].skillAtk[i][j][key]["hold_value" + k]/100);
                        }
                    }
                    body.innerHTML += debuffNum.round(5);
                    if (chargeDebuffNum != 1) {
                        body.innerHTML += "/" + (debuffNum*chargeDebuffNum).round(5);
                    }
                    body.innerHTML += "<br>";
                }
            }
        }
    }
    
    // ultimate 
    {
        var cell = document.getElementById("characterUltimate");
        cell.innerHTML = "";
        cell.innerHTML += "<b>" + characterData[dataKey].ultimate.name + "</b>";
        cell.innerHTML += "<br>";
        
        var totalValue = cell.appendChild(document.createElement("div"));
        { // damage
            totalValue.innerHTML = "總倍率: ";
            var baseDamageNum = characterData[dataKey].ultimate.dmg;
            var hitDamageNum = 0;
            for (var key in characterData[dataKey].ultimateAtk) {
                hitDamageNum += (characterData[dataKey].ultimateAtk[key].dmg/100);
            }
            totalValue.innerHTML += (baseDamageNum * hitDamageNum).round(5);
            totalValue.innerHTML += "  ";
        }
        
        { // break
            totalValue.innerHTML += "總破甲:";
            var baseBreakNum = characterData[dataKey].ultimate.break_;
            var hitBreakNum = 0;
            for (var key in characterData[dataKey].ultimateAtk) {
                hitBreakNum += (characterData[dataKey].ultimateAtk[key].break_/100);
            }
            totalValue.innerHTML += (baseBreakNum * hitBreakNum).round(5);
            totalValue.innerHTML += "  ";
        }
        
        { // gravity
            totalValue.innerHTML += "總重力:";
            var hitGravityNum = 0;
            for (var key in characterData[dataKey].ultimateAtk) {
                hitGravityNum += (characterData[dataKey].ultimateAtk[key].gravity);
            }
            totalValue.innerHTML += hitGravityNum.round(5);
            totalValue.innerHTML += "  ";
        }
        
        { // debuff
            var debuffType = 0;
            for (var key in characterData[dataKey].ultimateAtk) {
                if (characterData[dataKey].ultimateAtk[key].debuff != 0) { 
                    debuffType = characterData[dataKey].ultimateAtk[key].debuff;
                    break;
                }
            }
            
            if (debuffType != 0) {
                totalValue.innerHTML += "總" + DebuffType[debuffType] + ": ";
                var hitDebuffNum = 0;
                for (var key in characterData[dataKey].ultimateAtk) {
                    hitDebuffNum += (characterData[dataKey].ultimateAtk[key].debuff_value);
                }
                totalValue.innerHTML += hitDebuffNum.round(5);
                totalValue.innerHTML += "  ";
            }
        }
        
        var detailTable = cell.appendChild(document.createElement("table"));
        detailTable.className = "detailTable";
        var detailTableHeader = detailTable.appendChild(document.createElement("tr"));
        var detailTableRow = detailTable.appendChild(document.createElement("tr"));
        for (var key in characterData[dataKey].ultimateAtk) {
            var header = detailTableHeader.appendChild(document.createElement("th"));
            header.innerHTML = "第" + key + "擊";
            
            var body = detailTableRow.appendChild(document.createElement("td"));
            
            { // damage
                body.innerHTML = "倍率: ";
                var damageNum = characterData[dataKey].ultimate.dmg;
                damageNum *= (characterData[dataKey].ultimateAtk[key].dmg/100);
                body.innerHTML += damageNum.round(5);
                body.innerHTML += "<br>";
            }
            
            { //break
                body.innerHTML += "破甲: ";
                var breakNum = characterData[dataKey].ultimate.break_;
                breakNum *= (characterData[dataKey].ultimateAtk[key].break_/100);
                body.innerHTML += breakNum.round(5);
                body.innerHTML += "<br>";
            }
            
            { // gravity
                body.innerHTML += "重力: ";
                var gravityNum = characterData[dataKey].ultimateAtk[key].gravity;
                body.innerHTML += gravityNum.round(5);
                body.innerHTML += "<br>";
            }
            
            if (characterData[dataKey].ultimateAtk[key].debuff != 0) {
                body.innerHTML += DebuffType[characterData[dataKey].ultimateAtk[key].debuff] + ": ";
                var debuffNum = characterData[dataKey].ultimateAtk[key].debuff_value;
                body.innerHTML += debuffNum.round(5);
                body.innerHTML += "<br>";
            }
        }
    }
    
    document.getElementById("characterSearchTab").style.display = "block";
    searchButton.disabled = false;
}

function NoCharacter() {
    searchButton.disabled = false;    
}