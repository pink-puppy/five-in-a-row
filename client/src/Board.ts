import { EventEmitter } from "events";

const CELLSIZE = 30;
const STONE_SIZE = 13;

interface Stone {
    x: number,
    y: number,
    side: number,
}

export default class Board extends EventEmitter {
    ctx: CanvasRenderingContext2D;
    startX = 15;
    startY = 15;
    canvasWidth = 0;
    canvasHeight = 0;
    mouseX = 0;
    mouseY = 0;
    mouseEnabled = false;
    yourTurn = false;
    yourSide = 0;
    stones: (Stone | null)[] = [];
    constructor(public canvas: HTMLCanvasElement) {
        super();
        this.stones = Array.from({ length: 15 * 15 });
        this.ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
        this.canvasWidth = canvas.width;
        this.canvasHeight = canvas.height;
        canvas.addEventListener('click', this.onClick);
        canvas.addEventListener('mousemove', (e) => {
            this.mouseX = e.offsetX;
            this.mouseY = e.offsetY;
        });
        canvas.addEventListener('mouseenter', () => this.mouseEnabled = true);
        canvas.addEventListener('mouseleave', () => this.mouseEnabled = false);
        requestAnimationFrame(this.onUpdate);
    }

    start() {
        this.stones = [];
    }

    onUpdate = (time: number) => {
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        this.draw();
        requestAnimationFrame(this.onUpdate);
    }

    draw() {
        this.drawLines();
        this.canvas.style.cursor = 'default';
        if (this.mouseEnabled && this.yourTurn) {
            const { x, y } = this.mousePosToCoordinate(this.mouseX, this.mouseY);
            if (this.stones[x + y * 15]) {
                this.canvas.style.cursor = 'not-allowed'
            }
            this.drawCursor(x, y);
        }
        this.drawStones();
    }

    mousePosToCoordinate(x: number, y: number) {
        const rx = x - this.startX;
        const ry = y - this.startY;
        const ix = Math.max(0, Math.floor(rx / CELLSIZE));
        const iy = Math.max(0, Math.floor(ry / CELLSIZE));
        const offsetX = (rx % CELLSIZE) > (CELLSIZE / 2) ? 1 : 0;
        const offsetY = (ry % CELLSIZE) > (CELLSIZE / 2) ? 1 : 0;
        return {
            x: ix + offsetX,
            y: iy + offsetY
        }
    }

    onClick = (e: MouseEvent) => {
        if (!this.yourTurn)
            return;
        const { x, y } = this.mousePosToCoordinate(e.offsetX, e.offsetY);
        const index = x + y * 15;
        if (this.stones[index]) {
            return;
        } else {
            this.emit('occupation', index);
            this.yourTurn = false;
        }
    }

    setStone(index: number, side: number) {
        const x = index % 15;
        const y = Math.floor(index / 15);
        this.stones[index] = { x, y, side };
    }

    drawStones() {
        this.stones.forEach(n => {
            if (n) {
                this.ctx.beginPath();
                const x = n.x * CELLSIZE + this.startX;
                const y = n.y * CELLSIZE + this.startY;
                this.ctx.arc(x, y, STONE_SIZE, 0, Math.PI * 2);
                this.ctx.fillStyle = n.side === 0 ? 'black' : 'white';
                this.ctx.strokeStyle = 'black';
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.stroke();
            }
        })
    }

    drawCursor(x: number, y: number) {
        const ox = x * CELLSIZE + this.startX;
        const oy = y * CELLSIZE + this.startY;
        const size = 8;
        this.ctx.beginPath();
        this.ctx.moveTo(ox - size, oy);
        this.ctx.lineTo(ox + size, oy);
        this.ctx.moveTo(ox, oy - size);
        this.ctx.lineTo(ox, oy + size);
        this.ctx.closePath();
        this.ctx.strokeStyle = 'red';
        this.ctx.stroke();
    }

    drawLines() {
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        for (let x = 0; x < 15; x++) {
            this.ctx.moveTo(this.startX + x * CELLSIZE + .5, this.startY);
            this.ctx.lineTo(this.startX + x * CELLSIZE + .5, this.startY + 14 * CELLSIZE);
            this.ctx.moveTo(this.startX, x * CELLSIZE + .5 + this.startY);
            this.ctx.lineTo(this.startX + 14 * CELLSIZE, this.startY + x * CELLSIZE + .5);
        }
        this.ctx.closePath();
        this.ctx.strokeStyle = 'black';
        this.ctx.stroke();
    }
}