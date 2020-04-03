const ballRadius = 10;

function runGame() {
  let canvas = document.getElementById("myCanvas");
  let ctx = canvas.getContext("2d");
  let state = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: 2,
    dy: -2
  };
  let handler = () => draw(canvas, ctx, state);
  setInterval(handler, 10);
}

function draw(canvas, ctx, state) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let { x, y, dx, dy } = state;
  drawBall(ctx, x, y);

  state.x += dx;
  state.y += dy;

  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
    state.dx = -dx;
  }
  if (y + dy > canvas.height - ballRadius || y + dy < ballRadius) {
    state.dy = -dy;
  }
}

function drawBall(ctx, x, y) {
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}
