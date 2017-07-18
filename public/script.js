function empty() {
  var x;
  x = document.getElementById("locate").value;
  if (x === "") {
    alert("Enter a valid location");
    return false;
  }
}

function change(go)
{

  if (go.innerHTML=="Not going") go.innerHTML = "I'm going!";
  else go.innerHTML = "Not going";
}
function empty() {
  var x;
  x = document.getElementById("locate").value;
  if (x === "") {
    alert("Enter a valid location");
    return false;
  }
}
