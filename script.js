/* 四麻 or 三麻 */
const players_doc = document.querySelector('#players');
/* 三麻のツモ時のルール */
const rule_doc = document.querySelector('#rule');
/* プレイヤー名入力欄 */
const player_name_input_doc = document.querySelectorAll('.player_name_input');
/* 点数表示 */
const player_points_doc = document.querySelectorAll('.player_points');
/* 供託表示 */
const points_deposit_doc = document.querySelector('#points_deposit');
/* 積み棒表示 */
const points_stack_doc = document.querySelector('#points_stack');
/* プレイヤー名表示 */
const player_name_doc = document.querySelectorAll('.player_name');
/* 親 */
const leader_doc = document.getElementsByName('leader');
/* 親の値 */
let leader_value;
/* 和了者 */
const winner_doc = document.getElementsByName('winner');
/* 和了者の値 */
let winner_value;
/* ツモ or ロン */
const win_type_doc = document.getElementsByName('win_type');
/* ツモ or ロンの値 */
let win_type_value;
/* 符 */
const points_doc = document.querySelector('#points');
/* 翻 */
const doubles_doc = document.querySelector('#doubles');
/* 移動点数表示 */
const player_change_doc = document.querySelectorAll('.player_change');
/* 聴牌者 */
const ready_hand_doc = document.querySelectorAll('.ready_hand');
/* 配給原点 */
const tally_doc = document.querySelector('#tally');
/* リーチ棒点数 */
const call_doc = document.querySelector('#call');
/* 積み棒点数 */
const stack_doc = document.querySelector('#stack');
/* ノーテン罰符 */
const penalty_doc = document.querySelector('#penalty');

/* 基礎点と実際の支払い点の倍率 */
/* 特殊なものは文字列を代入、関数も別途用意 */
/* 順に親ツモ時の子の支払い、親ロン、子ツモ時の親の支払い、子ツモ時の子の支払い、子ロン */
const score_multiply = {
  four:[2n, 6n, 2n, 1n, 4n],
  loss:[2n, 6n, 2n, 1n, 4n],
  northharf:["harf_3.0", 6n, "harf_2.5", "harf_1.5", 4n],
  harf:[3n, 6n, 2n, 2n, 4n],
  triple:[3n, 6n, 3n, 1n, 4n]
};

/* 読み込み完了時初期化 */
window.onload = function(){
  players_doc[0].selected = true;
  rule_doc[0].selected = true;
  value_change(player_name_input_doc, ["", "", "", ""]);
  initialize_rule_selected();
  player_name_change();
  points_doc.value = "";
  doubles_doc.value = "";
  update_radio_value();
  tally_doc.value = 25000n;
  call_doc.value = 1000n;
  stack_doc.value = 100n;
}

/* ルール変更時選択可能範囲変更 */
function initialize_rule_selected(){
  let tally = BigInt(tally_doc.value);

  if(tally % 100n != 0n){
    alert("tally is an invalid value.\n");
    return 1;
  }

  points_deposit_doc.value = 0n;
  points_stack_doc.value = 0n;
  leader_doc[0].checked = true;
  winner_doc[0].checked = true;
  checked_change(ready_hand_doc, [0, 0, 0, 0]);

  if(players_doc.value == 4){
    rule_doc.disabled = true;
    player_name_input_doc[3].disabled = false;
    value_change(player_points_doc, [tally, tally, tally, tally]);
    player_points_doc[3].disabled = false;
    player_change_doc[3].disabled = false;
    leader_doc[3].disabled = false;
    winner_doc[3].disabled = false;
    ready_hand_doc[3].disabled = false;
  }
  else if(players_doc.value == 3){
    rule_doc.disabled = false;
    player_name_input_doc[3].disabled = true;
    value_change(player_points_doc, [tally, tally, tally, ""]);
    player_points_doc[3].disabled = true;
    player_change_doc[3].disabled = true;
    leader_doc[3].disabled = true;
    winner_doc[3].disabled = true;
    ready_hand_doc[3].disabled = true;
  }

  initialize_winner_selected();
}

/* 親変更時点数リセット */
function initialize_leader_selected(){
  if(players_doc.value == 4)
    value_change(player_change_doc, [0n, 0n, 0n, 0n]);
  else if(players_doc.value == 3)
    value_change(player_change_doc, [0n, 0n, 0n, ""]);
}

/* 和了者変更時選択可能範囲変更 */
function initialize_winner_selected(){
  win_type_doc[0].checked = true;

  let disabled_flag = [0, 0, 0, 0, 0];

  if(players_doc.value == 3)
    disabled_flag[4] = 1;

  for(let n = 0; n < 4; n++){
    if(winner_doc[n].checked)
      disabled_flag[n + 1] = 1;
  }

  disabled_change(win_type_doc, disabled_flag);

  initialize_leader_selected();
}

/* プレイヤー名反映 */
function player_name_change(){
  let name_list = new Array(4);

  for(let n = 0; n < 4; n++){
    if(player_name_input_doc[n].value == "")
      name_list[n] = player_name_input_doc[n].placeholder;
    else
      name_list[n] = player_name_input_doc[n].value;
  }

  for(n = 0; n < player_name_doc.length; n++)
    player_name_doc[n].innerHTML = name_list[n % 4];
}

/* リーチ時点数変更 */
function deposit_score(player_number){
  let call_points = BigInt(call_doc.value);
  
  if(call_points % 100n != 0n){
    alert("call is an invalid value.\n");
    return 1;
  }

  if(players_doc.value == 3 && player_number == 4){}
  else{
    player_points_doc[player_number - 1].value = BigInt(player_points_doc[player_number - 1].value) - call_points;
    points_deposit_doc.value = BigInt(points_deposit_doc.value) + call_points;
  }
}

/* 積み棒本数変更 */
function stack_change(number){
  if(number == 0)
    points_stack_doc.value = 0n;
  else{
    if(points_stack_doc.value == 0n && number == -1){}
    else
      points_stack_doc.value -= -number;
  }
}

/* 移動点計算 */
/* ほとんどの処理は他関数が実行 */
function calc_score(){
  let basic_score = calc_basicscore();
  let score = new Array(4);

  if(typeof(basic_score) != "bigint")
    return 1;
  
  let stack_points = BigInt(stack_doc.value);
  
  if(stack_points % 100n != 0n){
    alert("stack is an invalid value.\n");
    return 1;
  }

  if(players_doc.value == 4)
    score = calc_score_four(basic_score);
  else if(players_doc.value == 3){
    if(rule_doc.value == "northharf")
      score = calc_score_northharf(basic_score);
    else
      score = calc_score_three(basic_score);
  }
  
  value_change(player_change_doc, score);
}

/* 基礎点計算 */
function calc_basicscore(){
  const points_value = points_doc.value;
  const doubles_value = doubles_doc.value;
  let err_text = "";

  if(points_value == 25 || (points_value % 10 == 0 && points_value >= 20)){}
  else
    err_text += "points is an invalid value.\n";
  
  if(doubles_value >= 1){}
  else
    err_text += "doubles is an invalid value.\n";

  if(err_text != ""){
    alert(err_text);
    return err_text;
  }

  let basic_score;

  basic_score = BigInt(points_value) << (BigInt(doubles_value) + 2n);

  return basic_score;
}

/* 四麻点数計算 */
function calc_score_four(basic_score){
  const stack_points = BigInt(stack_doc.value) * BigInt(points_stack_doc.value);
  let score = [0n, 0n, 0n, 0n];
  let winner_score = 0n;
  let n;

  update_radio_value();

  if(leader_value == winner_value){ /* 親の和了 */
    if(win_type_value == 0){ /* ツモ */
      for(n = 0; n < 4; n++){
        if(n != winner_value - 1){
          score[n] = -ceil_hundreds(basic_score * score_multiply["four"][0]) - stack_points;
          winner_score -= score[n];
        }
      }

      score[winner_value - 1] = winner_score;
    }
    else{ /* ロン */
      score[win_type_value - 1] = -ceil_hundreds(basic_score * score_multiply["four"][1]) - stack_points * 3n;
      score[winner_value - 1] = -score[win_type_value - 1];
    }
  }
  else{ /* 子の和了 */
    if(win_type_value == 0){ /* ツモ */
      for(n = 0; n < 4; n++){
        if(n == leader_value - 1){
          score[n] = -ceil_hundreds(basic_score * score_multiply["four"][2]) - stack_points;
          winner_score -= score[n];
        }
        else if(n != winner_value - 1){
          score[n] = -ceil_hundreds(basic_score * score_multiply["four"][3]) - stack_points;
          winner_score -= score[n];
        }
      }

      score[winner_value - 1] = winner_score;
    }
    else{ /* ロン */
      score[win_type_value - 1] = -ceil_hundreds(basic_score * score_multiply["four"][4]) - stack_points * 3n;
      score[winner_value - 1] = -score[win_type_value - 1];
    }
  }

  return score;
}

/* 三麻点数計算(一般) */
function calc_score_three(basic_score){
  const stack_points = BigInt(stack_doc.value) * BigInt(points_stack_doc.value);
  let score = [0n, 0n, 0n, ""];
  let winner_score = 0n;
  let n;

  update_radio_value();

  if(leader_value == winner_value){ /* 親の和了 */
    if(win_type_value == 0){ /* ツモ */
      for(n = 0; n < 3; n++){
        if(n != winner_value - 1){
          score[n] = -ceil_hundreds(basic_score * score_multiply[rule_doc.value][0]) - stack_points;
          winner_score -= score[n];
        }
      }

      score[winner_value - 1] = winner_score;
    }
    else{ /* ロン */
      score[win_type_value - 1] = -ceil_hundreds(basic_score * score_multiply[rule_doc.value][1]) - stack_points * 2n;
      score[winner_value - 1] = -score[win_type_value - 1];
    }
  }
  else{ /* 子の和了 */
    if(win_type_value == 0){ /* ツモ */
      for(n = 0; n < 3; n++){
        if(n == leader_value - 1){
          score[n] = -ceil_hundreds(basic_score * score_multiply[rule_doc.value][2]) - stack_points;
          winner_score -= score[n];
        }
        else if(n != winner_value - 1){
          score[n] = -ceil_hundreds(basic_score * score_multiply[rule_doc.value][3]) - stack_points;
          winner_score -= score[n];
        }
      }

      score[winner_value - 1] = winner_score;
    }
    else{ /* ロン */
      score[win_type_value - 1] = -ceil_hundreds(basic_score * score_multiply[rule_doc.value][4]) - stack_points * 2n;
      score[winner_value - 1] = -score[win_type_value - 1];
    }
  }

  return score;
}

/* 三麻点数計算(北家折半)) */
/* 北家分の点数の半分の切り上げを後から追加するため、ツモ和了が特殊処理 */
function calc_score_northharf(basic_score){
  const stack_points = BigInt(stack_doc.value) * BigInt(points_stack_doc.value);
  let score = [0n, 0n, 0n, ""];
  let winner_score = 0n;
  let n;

  update_radio_value();

  if(leader_value == winner_value){ /* 親の和了 */
    if(win_type_value == 0){ /* ツモ */
      for(n = 0; n < 3; n++){
        if(n != winner_value - 1){
          score[n] = -ceil_hundreds(basic_score * 2n) - ceil_hundreds(basic_score) - stack_points;
          winner_score -= score[n];
        }
      }

      score[winner_value - 1] = winner_score;
    }
    else{ /* ロン */
      score[win_type_value - 1] = -ceil_hundreds(basic_score * score_multiply[rule_doc.value][1]) - stack_points * 2n;
      score[winner_value - 1] = -score[win_type_value - 1];
    }
  }
  else{ /* 子の和了 */
    if(win_type_value == 0){ /* ツモ */
      for(n = 0; n < 3; n++){
        if(n == leader_value - 1){
          score[n] = -ceil_hundreds(basic_score * 2n) - ceil_hundreds(basic_score / 2n) - stack_points;
          winner_score -= score[n];
        }
        else if(n != winner_value - 1){
          score[n] = -ceil_hundreds(basic_score) - ceil_hundreds(basic_score / 2n) - stack_points * 2n;
          winner_score -= score[n];
        }
      }

      score[winner_value - 1] = winner_score;
    }
    else{ /* ロン */
      score[win_type_value - 1] = -ceil_hundreds(basic_score * score_multiply[rule_doc.value][4]) - stack_points;
      score[winner_value - 1] = -score[win_type_value - 1];
    }
  }

  return score;
}

/* 百の位の切り上げ */
function ceil_hundreds(number){
  number = (number + 99n) / 100n;
  number *= 100n;

  return number;
}

/* 点数移動実行 */
function move_score(){
  let number = Number(players_doc.value);

  //update_radio_value();
  
  for(let n = 0; n < number; n++){
    player_points_doc[n].value = BigInt(player_points_doc[n].value) + BigInt(player_change_doc[n].value);
    player_change_doc[n].value = 0n;
  }

  player_points_doc[winner_value - 1].value = BigInt(player_points_doc[winner_value - 1].value) + BigInt(points_deposit_doc.value);
  points_deposit_doc.value = 0n;
}

/* ノーテン罰符移動実行 */
function move_penalty(){
  let penalty_points = BigInt(penalty_doc.value);
  let players = Number(players_doc.value);
  let ready_players = 0;
  let flag = new Array(players);
  let moving_score = new Array(players);
  let n;

  if(players == 4){
    if(penalty_points % 600n != 0n){
      alert("penalty is an invalid value.\n");
      return 1;
    }
  }
  else if(players == 3){
    if(penalty_points % 200n != 0n){
      alert("penalty is an invalid value.\n");
      return 1;
    }
  }

  for(let n = 0; n < players; n++){
    if(ready_hand_doc[n].checked){
      flag[n] = 1;
      ready_players++;
    }
    else
      flag[n] = 0;
  }

  if(players == 4 && ready_players == 2){
    for(let n = 0; n < players; n++){
      if(flag[n] == 1)
        moving_score[n] = penalty_points / 2n;
      else
        moving_score[n] = -penalty_points / 2n;
    }
  }
  else{
    if(ready_players == 0 || ready_players == players){
      for(n = 0; n < players; n++)
        moving_score[n] = 0n;
    }
    else{
      for(n = 0; n < players; n++){
        if(flag[n] == 1)
          moving_score[n] = penalty_points / BigInt(ready_players);
        else
          moving_score[n] = -penalty_points * BigInt(ready_players) / (BigInt(players) - 1n);
      }
    }
  }

  for(let n = 0; n < players; n++)
    player_points_doc[n].value = BigInt(player_points_doc[n].value) + moving_score[n];
  
  checked_change(ready_hand_doc, [0, 0, 0, 0]);
}

/* ラジオボタン値更新 */
/* 以下の値を使用する際は使用前にこの関数を呼び出すこと */
function update_radio_value(){
  leader_value = get_radio_value(leader_doc);
  winner_value = get_radio_value(winner_doc);
  win_type_value = get_radio_value(win_type_doc);
}

/* ラジオボタン値取得 */
function get_radio_value(doc){
  let value;

  for(let arr in doc){
    if(doc[arr].checked){
      value = doc[arr].value;
      break;
    }
  }

  return value;
}

/* ラジオボタン利用可能範囲一括変更 */
/* docとflagに同じ長さの配列を渡すと、disabledの値がflagの通りに変更される */
function disabled_change(doc, disabled_flag){
  let n = 0;

  if(Object.keys(doc).length != disabled_flag.length){
    throw new Error("Object.keys(doc).length != disabled_flag.length");
    return 1;
  }

  for(let arr in doc){
    doc[arr].disabled = disabled_flag[n];
    n++;
  }
  
  return 0;
}

/* チェックボックス値一括変更 */
/* docとflagに同じ長さの配列を渡すと、checkedの値がflagの通りに変更される */
function checked_change(doc, checked_flag){
  let n = 0;

  if(Object.keys(doc).length != checked_flag.length){
    throw new Error("Object.keys(doc).length != checked_flag.length");
    return 1;
  }

  for(let arr in doc){
    doc[arr].checked = checked_flag[n];
    n++;
  }
  
  return 0;
}

/* テキストボックス値一括変更 */
/* docとtextに同じ長さの配列を渡すと、valueの値がtextの通りに変更される */
function value_change(doc, text){
  let n = 0;

  if(Object.keys(doc).length != text.length){
    throw new Error("Object.keys(doc).length != text.length");
    return 1;
  }

  for(let arr in doc){
    doc[arr].value = text[n];
    n++;
  }

  return 0;
}