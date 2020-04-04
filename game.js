const ballRadius = 10;
const paddleDimensions = [75, 10];
const staticBrickData = {
  rows: 3,
  columns: 5,
  width: 75,
  height: 20,
  // Between bricks
  padding: 10,
  offsetTop: 30,
  offsetLeft: 30
};

function runGame() {
  let canvas = document.getElementById("myCanvas");
  let ctx = canvas.getContext("2d");
  let userState = {
    gameRunning: true,
    score: 0,
    gameEndedInWin: undefined
  };
  let gameOverHandler = (isWin, finalScore) => {
    userState.gameEndedInWin = isWin;
  };

  let bricks = [];
  for (let col = 0; col < staticBrickData.columns; col++) {
    bricks[col] = [];
    for (let row = 0; row < staticBrickData.rows; row++) {
      bricks[col][row] = { x: undefined, y: undefined, hit: false };
    }
  }

  let state = {
    ball: {
      x: canvas.width / 2,
      y: canvas.height / 2,
      dx: 2,
      dy: -2
    },
    paddle: {
      x: (canvas.width - paddleDimensions[0]) / 2
    },
    controls: {
      leftPressed: false,
      rightPressed: false
    },
    user: userState,
    bricks,
    gameOverHandler
  };

  let keyHandler = isUpHandler => e => {
    if (e.key == "Right" || e.key == "ArrowRight") {
      state.controls.rightPressed = !isUpHandler;
    } else if (e.key == "Left" || e.key == "ArrowLeft") {
      state.controls.leftPressed = !isUpHandler;
    }
  };

  document.addEventListener("keyup", keyHandler(/*isUpHandler=*/ true), false);
  document.addEventListener(
    "keydown",
    keyHandler(/*isUpHandler=*/ false),
    false
  );

  let handler = () => draw(canvas, ctx, state);
  requestAnimationFrame(handler);
}

function draw(canvas, ctx, state) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawScore(ctx, state.user.score);
  drawBricks(ctx, state.bricks);
  drawBall(ctx, state.ball);
  drawPaddle(canvas, ctx, state.paddle);
  applyPhysics(canvas, state);

  // While game is started/not paused and not over, request new frames.
  if (state.user.gameRunning && state.user.gameEndedInWin == undefined) {
    requestAnimationFrame(() => draw(canvas, ctx, state));
  }
}

function drawScore(ctx, score) {
  ctx.font = "16px Arial";
  ctx.fillStyle = "#0095DD";
  ctx.fillText("Score: " + score, 8, 20);
}

function drawBall(ctx, ball) {
  let { x, y } = ball;
  ctx.beginPath();
  ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle(canvas, ctx, paddle) {
  let [paddleWidth, paddleHeight] = paddleDimensions;
  ctx.beginPath();
  ctx.rect(paddle.x, canvas.height - paddleHeight, paddleWidth, paddleHeight);
  ctx.fillStyle = "#0095DD";
  ctx.fill();
  ctx.closePath();
}

function drawBricks(ctx, bricks) {
  let {
    rows,
    columns,
    width,
    height,
    padding,
    offsetLeft,
    offsetTop
  } = staticBrickData;
  for (let c = 0; c < columns; c++) {
    for (let r = 0; r < rows; r++) {
      if (bricks[c][r].hit) continue;
      let brickX = c * (width + padding) + offsetLeft;
      let brickY = r * (height + padding) + offsetTop;
      bricks[c][r].x = brickX;
      bricks[c][r].y = brickY;
      ctx.beginPath();
      ctx.rect(brickX, brickY, width, height);
      ctx.fillStyle = "#0095DD";
      ctx.fill();
      ctx.closePath();
    }
  }
}

function applyPhysics(canvas, state) {
  let ballState = state.ball;
  let { x, y, dx, dy } = ballState;

  ballState.x += dx;
  ballState.y += dy;

  if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
    ballState.dx = -dx;
  }
  if (y + dy < ballRadius) {
    ballState.dy *= -1;
  } else if (y + dy > canvas.height - ballRadius) {
    // FIXME: we're ignoring paddle here.
    if (x < state.paddle.x + paddleDimensions[0] && x > state.paddle.x) {
      ballState.dy *= -1;
    } else {
      // FIXME: calling gameOverHandler in applyPhysics is weird.
      state.gameOverHandler(/*isWin=*/ false, state.user.score);
    }
  }

  let { leftPressed, rightPressed } = state.controls;
  if (leftPressed) {
    state.paddle.x = clampPaddle(canvas.width, state.paddle.x - 7);
  } else if (rightPressed) {
    state.paddle.x = clampPaddle(canvas.width, state.paddle.x + 7);
  }

  let { rows, columns, width, height } = staticBrickData;
  for (let col = 0; col < columns; col++) {
    for (let row = 0; row < rows; row++) {
      let brick = state.bricks[col][row];
      if (!brick.hit) {
        let xCollision = x > brick.x && x < brick.x + width;
        let yCollision = y > brick.y && y < brick.y + height;
        if (xCollision && yCollision) {
          ballState.dy *= -1;
          brick.hit = true;
          state.user.score += 1;
          if (state.user.score == rows * columns) {
            state.gameOverHandler(/*isWin=*/ true, state.user.score);
          }
        }
      }
    }
  }
}

function clampPaddle(canvasWidth, newX) {
  if (newX < 0) {
    return 0;
  } else if (newX + paddleDimensions[0] > canvasWidth) {
    return canvasWidth - paddleDimensions[0];
  } else {
    return newX;
  }
}
