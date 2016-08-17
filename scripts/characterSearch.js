var searchButton = document.getElementById("searchButton");
var searchName = document.getElementById("searchName");

var characterDataTable = document.getElementById("characterDataTable");

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
];

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
            for (var key in charactersData) {
                characterData.character = charactersData[key];
                characterDataReaded.character = true;
                if (CheckDataReaded()) {
                    DeployData();
                }
                
                ReadRelationData(characterData.character.partner_id);
                
                characterData.ability = {};
                ReadAbilityData(characterData.character.ability01, 1)
                ReadAbilityData(characterData.character.ability02, 2)
                ReadAbilityData(characterData.character.ability03, 3)
                ReadAbilityData(characterData.character.ability04, 4)
                
                ReadCommandData(characterData.character.id);
                
                break;
            }
        }
    });
}

function ReadRelationData(partnerID) {
    currentDB.database().ref("/unit/" + partnerID).once("value").then(function(dataSnapshot) {
        var data = dataSnapshot.val();
        
        characterData.partner = data;
        characterDataReaded.partner = true;
        if (CheckDataReaded()) {
            DeployData();
        }
    });
}

function ReadAbilityData(abilityID, abilityNum) {
    currentDB.database().ref("/ability/" + abilityID).once("value").then(function(dataSnapshot) {
        var data = dataSnapshot.val();
        
        characterData.ability[abilityNum] = data;
        characterDataReaded["ability" + abilityNum] = true;
        if (CheckDataReaded()) {
            DeployData();
        }
    });
}

function ReadCommandData(characterID) {
       currentDB.database().ref("/unit_command/" + characterID).once("value").then(function(dataSnapshot) {
        var data = dataSnapshot.val();
        
        characterData.command = data;
        characterDataReaded["command"] = true;
        if (CheckDataReaded()) {
            DeployData();
        }
        
        characterData.skillBase = {};
        characterData.skillUpgrade = {};
        characterData.skill = {};
        characterData.skillAtk = {};
        for(var key in characterData.command) {
            ReadSkillBase(characterData.command[key].skill_id, characterData.command[key].index);            
            ReadSkillUpgrade(characterData.command[key].skill_id, characterData.command[key].index);
        }
    }); 
}

function ReadSkillBase(skillID, skillNum) {
    currentDB.database().ref("/skill_base/" + skillID).once("value").then(function(dataSnapshot) {
        var data = dataSnapshot.val();
        
        characterData.skillBase[skillNum] = data;
        characterDataReaded["skillBase" + skillNum] = true;
        if (CheckDataReaded()) {
            DeployData();
        }
    });
}

function ReadSkillUpgrade(skillID, skillNum) {
    currentDB.database().ref("/skill_upgrade/" + skillID).once("value").then(function(dataSnapshot) {
        var data = dataSnapshot.val();
        
        characterData.skillUpgrade[skillNum] = data;
        characterDataReaded["skillUpgrade" + skillNum] = true;
        if (CheckDataReaded()) {
            DeployData();
        }
        
        characterData.skill[skillNum] = {};
        characterData.skillAtk[skillNum] = {};
        for (var key in characterData.skillUpgrade[skillNum]) {
            ReadSkill(characterData.skillUpgrade[skillNum][key].skill_evolve, skillNum, characterData.skillUpgrade[skillNum][key].rank);
            ReadSkillAtk(characterData.skillUpgrade[skillNum][key].skill_evolve, skillNum, characterData.skillUpgrade[skillNum][key].rank);
        }
    });
}

function ReadSkill(skillUpgradeID, skillNum, skillUpgradeNum) {
    currentDB.database().ref("/skill/" + skillUpgradeID).once("value").then(function(dataSnapshot) {
        var data = dataSnapshot.val();
        
        characterData.skill[skillNum][skillUpgradeNum] = data;
        characterDataReaded[("skill" + skillNum) + skillUpgradeNum] = true;
        if (CheckDataReaded()) {
            DeployData();
        }
    });
}

function ReadSkillAtk(skillUpgradeID, skillNum, skillUpgradeNum) {
    currentDB.database().ref("/skill_atk/" + skillUpgradeID).once("value").then(function(dataSnapshot) {
        var data = dataSnapshot.val();
        
        characterData.skillAtk[skillNum][skillUpgradeNum] = data;
        characterDataReaded[("skillAtk" + skillNum) + skillUpgradeNum] = true;
        if (CheckDataReaded()) {
            DeployData();
        }
    });
}

function CheckDataReaded() {
    for (var key in characterDataShouldRead) {
        if (IsNull(characterDataReaded[characterDataShouldRead[key]])) {
            return false;
        }
    }
    return true;
}

function DeployData() {
    document.getElementById("characterName").innerHTML = "";
    if (characterData.character.nickname != "") {
        document.getElementById("characterName").innerHTML = characterData.character.nickname + "<br>";
    }
    document.getElementById("characterName").innerHTML += characterData.character.name;
    
    document.getElementById("characterRarity").innerHTML = characterData.character.rarity;
    document.getElementById("characterElement").innerHTML = ElementType[characterData.character.use_element];
    document.getElementById("characterJob").innerHTML = JobType[characterData.character.job_id-1];
    
    document.getElementById("characterPartner").innerHTML = "";
    if (characterData.partner.nickname != "") {
        document.getElementById("characterPartner").innerHTML = characterData.partner.nickname + "<br>";
    }
    document.getElementById("characterPartner").innerHTML += characterData.partner.name;

    for (var i=1 ; i<=4 ; i++) {
        if (IsNull(characterData.ability[i])) {
            document.getElementById("characterAbility" + i).innerHTML = "";
        } else {
            document.getElementById("characterAbility" + i).innerHTML = "<b>" + characterData.ability[i].name.replace("\n", "") + "</b><br>";
            document.getElementById("characterAbility" + i).innerHTML += characterData.ability[i].comment.replace("\\n", "");
        }
    }

    for (var i=1 ; i<=4 ; i++) {
        document.getElementById("characterTrait" + i).innerHTML = characterData.partner["Characteristic" + i];
    }
    
    for (var i=1 ; i<=3 ; i++) {
        for (var j=1 ; j<=4 ; j++) {
            var cell = document.getElementById("characterAttack" + i + "level" + j);
            cell.innerHTML = "";
            cell.innerHTML += "<b>" + characterData.skill[i-1][j].name + "</b><br>";
            
            var totalValue = cell.appendChild(document.createElement("div"));
            
            { // damage
                totalValue.innerHTML = "總倍率: ";
                var baseDamageNum = characterData.skillBase[i-1].dmg;
                var upgradeDamageNum = 1;
                for (var k=1 ; k<=3 ; k++) {
                    if (characterData.skillUpgrade[i-1][j]["upgrade_type" + k] == 1) {
                        upgradeDamageNum *= (characterData.skillUpgrade[i-1][j]["upgrade_value" + k]/100);
                    }
                }
                var hitDamageNum = 0;
                for (var key in characterData.skillAtk[i-1][j]) {
                    hitDamageNum += (characterData.skillAtk[i-1][j][key].dmg/100);
                }
                var chargeDamageNum = 1;
                for (var k=1 ; k<=3 ; k++) {
                    if (characterData.skillAtk[i-1][j]["hold_type" + k] == 1) {
                        chargeDamageNum *= (characterData.skillAtk[i-1][j]["hold_type" + k]/100);
                    }
                }
                totalValue.innerHTML += (baseDamageNum * upgradeDamageNum * hitDamageNum).round(5);
                if (chargeDamageNum != 1) {
                    totalValue.innerHTML += "/" + (baseDamageNum * upgradeDamageNum * hitDamageNum * chargeDamageNum).round(5);
                }
                totalValue.innerHTML += "<br>";
            }
            
            { // break
                totalValue.innerHTML += "總破甲:";
                var baseBreakNum = characterData.skillBase[i-1].break_;
                var upgradeBreakNum = 1;
                for (var k=1 ; k<=3 ; k++) {
                    if (characterData.skillUpgrade[i-1][j]["upgrade_type" + k] == 7) {
                        upgradeBreakNum *= (characterData.skillUpgrade[i-1][j]["upgrade_value" + k]/100);
                    }
                }
                var hitBreakNum = 0;
                for (var key in characterData.skillAtk[i-1][j]) {
                    hitBreakNum += (characterData.skillAtk[i-1][j][key].dmg/100);
                }
                var chargeBreakNum = 1;
                for (var k=1 ; k<=3 ; k++) {
                    if (characterData.skillAtk[i-1][j]["hold_type" + k] == 12) {
                        chargeBreakNum *= (characterData.skillAtk[i-1][j]["hold_type" + k]/100);
                    }
                }
                totalValue.innerHTML += (baseBreakNum * upgradeBreakNum * hitBreakNum).round(5);
                if (chargeBreakNum != 1) {
                    totalValue.innerHTML += "/" + (baseBreakNum * upgradeBreakNum * hitBreakNum * chargeBreakNum).round(5);
                }
                totalValue.innerHTML += "<br>";
            }
            
            {
                totalValue.innerHTML += "總仇恨:";
                var baseHateNum = characterData.skillBase[i-1].break_;
                var upgradeHateNum = 1;
                for (var k=1 ; k<=3 ; k++) {
                    if (characterData.skillUpgrade[i-1][j]["upgrade_type" + k] == 1) {
                        upgradeHateNum *= (characterData.skillUpgrade[i-1][j]["upgrade_value" + k]/100);
                    }
                }
                var hitHateNum = 0;
                for (var key in characterData.skillAtk[i-1][j]) {
                    hitHateNum += (characterData.skillAtk[i-1][j][key].dmg/100);
                }
                var chargeHateNum = 1;
                for (var k=1 ; k<=3 ; k++) {
                    if (characterData.skillAtk[i-1][j]["hold_type" + k] == 7) {
                        chargeHateNum *= (characterData.skillAtk[i-1][j]["hold_type" + k]/100);
                    }
                }
                totalValue.innerHTML += (baseHateNum * upgradeHateNum * hitHateNum).round(5);
                if (chargeHateNum != 1) {
                    totalValue.innerHTML += "/" + (baseHateNum * upgradeHateNum * hitHateNum * chargeHateNum).round(5);
                }
                totalValue.innerHTML += "<br>";
            }
        }
    }
    
    for (var i=1 ; i<=4 ; i++) {
        for (var j=1 ; j<=4 ; j++) {
            var cell = document.getElementById("characterSkill" + i + "level" + j);
            cell.innerHTML = "";
            cell.innerHTML += "<b>" + characterData.skill[i+2][j].name + "</b>";
            cell.innerHTML += " CD: " + (characterData.skillBase[i+2].cd / 30).round(3);
            cell.innerHTML += "<br>";
            
            var totalValue = cell.appendChild(document.createElement("div"));
            
            { // damage
                totalValue.innerHTML = "總倍率: ";
                var baseDamageNum = characterData.skillBase[i+2].dmg;
                var upgradeDamageNum = 1;
                for (var k=1 ; k<=3 ; k++) {
                    if (characterData.skillUpgrade[i+2][j]["upgrade_type" + k] == 1) {
                        upgradeDamageNum *= (characterData.skillUpgrade[i+2][j]["upgrade_value" + k]/100);
                    }
                }
                var hitDamageNum = 0;
                for (var key in characterData.skillAtk[i+2][j]) {
                    hitDamageNum += (characterData.skillAtk[i+2][j][key].dmg/100);
                }
                var chargeDamageNum = 0;
                for (var key in characterData.skillAtk[i+2][j]) {
                    var chargeDamage = (characterData.skillAtk[i+2][j][key].dmg/100);
                    for (var k=1 ; k<=3 ; k++) {
                        if (characterData.skillAtk[i+2][j][key]["hold_type" + k] == 1) {
                            chargeDamage *= (characterData.skillAtk[i+2][j][key]["hold_value" + k]/100);
                        }
                    }
                    chargeDamageNum += chargeDamage;
                }
                totalValue.innerHTML += (baseDamageNum * upgradeDamageNum * hitDamageNum).round(5);
                if (chargeDamageNum != hitDamageNum) {
                    totalValue.innerHTML += "/" + (baseDamageNum * upgradeDamageNum * chargeDamageNum).round(5);
                }
                totalValue.innerHTML += "<br>";
            }
            
            { // break
                totalValue.innerHTML += "總破甲:";
                var baseBreakNum = characterData.skillBase[i+2].break_;
                var upgradeBreakNum = 1;
                for (var k=1 ; k<=3 ; k++) {
                    if (characterData.skillUpgrade[i+2][j]["upgrade_type" + k] == 7) {
                        upgradeBreakNum *= (characterData.skillUpgrade[i+2][j]["upgrade_value" + k]/100);
                    }
                }
                var hitBreakNum = 0;
                for (var key in characterData.skillAtk[i+2][j]) {
                    hitBreakNum += (characterData.skillAtk[i+2][j][key].break_/100);
                }
                var chargeBreakNum = 0;
                for (var key in characterData.skillAtk[i+2][j]) {
                    var chargeBreak = (characterData.skillAtk[i+2][j][key].break_/100);
                    for (var k=1 ; k<=3 ; k++) {
                        if (characterData.skillAtk[i+2][j][key]["hold_type" + k] == 12) {
                            chargeBreak *= (characterData.skillAtk[i+2][j][key]["hold_value" + k]/100);
                        }
                    }
                    chargeBreakNum += chargeBreak;
                }
                totalValue.innerHTML += (baseBreakNum * upgradeBreakNum * hitBreakNum).round(5);
                if (chargeBreakNum != hitBreakNum) {
                    totalValue.innerHTML += "/" + (baseBreakNum * upgradeBreakNum * chargeBreakNum).round(5);
                }
                totalValue.innerHTML += "<br>";
            }
            
            {
                totalValue.innerHTML += "總重力:";
                var baseGravityNum = 1;
                var upgradeGravityNum = 1;
                for (var k=1 ; k<=3 ; k++) {
                    if (characterData.skillUpgrade[i+2][j]["upgrade_type" + k] == 6) {
                        upgradeGravityNum *= (characterData.skillUpgrade[i+2][j]["upgrade_value" + k]/100);
                    }
                }
                var hitGravityNum = 0;
                for (var key in characterData.skillAtk[i+2][j]) {
                    hitGravityNum += (characterData.skillAtk[i+2][j][key].gravity);
                }
                var chargeGravityNum = 0;
                for (var key in characterData.skillAtk[i+2][j]) {
                    var chargeGravity = (characterData.skillAtk[i+2][j][key].gravity);
                    for (var k=1 ; k<=3 ; k++) {
                        if (characterData.skillAtk[i+2][j][key]["hold_type" + k] == 6) {
                            chargeGravity *= (characterData.skillAtk[i+2][j][key]["hold_value" + k]/100);
                        }
                    }
                    chargeGravityNum += chargeGravity;
                }
                totalValue.innerHTML += (baseGravityNum * upgradeGravityNum * hitGravityNum).round(5);
                if (chargeGravityNum != hitGravityNum) {
                    totalValue.innerHTML += "/" + (baseGravityNum * upgradeGravityNum * chargeGravityNum).round(5);
                }
                totalValue.innerHTML += "<br>";
            }
        }
    }
    
    document.getElementById("characterSearchTab").style.display = "block";
    searchButton.disabled = false;
}

function NoCharacter() {
    searchButton.disabled = false;    
}