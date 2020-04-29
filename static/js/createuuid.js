function createUUID() {
  // 12자리 16진수로 이루어진 UUID 생성하는 함수.
  function createS4() {
    var s4 = Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
    return s4;
  }
  return `${createS4()}-${createS4()}-${createS4()}`;
}

function init() {
  //uuid 생성해서 저장
  var uuid = createUUID();
  //세션 스토리지에 UUID 저장
  sessionStorage.setItem("user-id", uuid);
}

init();
