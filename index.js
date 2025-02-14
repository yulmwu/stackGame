const n = 5
const colors = ["red", "blue", "green", "yellow", "purple"]
let stacks = Array.from({ length: n }, () => [])
let selectedStack = null
let score = 0

const updateScore = (points) => {
    if (points) score += points
    document.getElementById("score").innerText = `점수: ${score}`
}

const renderStacks = () => {
    const board = document.getElementById("gameBoard")
    board.innerHTML = ""
    stacks.forEach((stack, index) => {
        const containerDiv = document.createElement("div")

        const stackDiv = document.createElement("div")
        stackDiv.classList.add("stack")
        if (selectedStack === index) stackDiv.classList.add("selected")
        stackDiv.dataset.index = index
        stackDiv.onclick = () => selectStack(index)

        stack.forEach((color) => {
            const item = document.createElement("div")
            item.classList.add("item")
            item.style.backgroundColor = color
            stackDiv.appendChild(item)
        })

        containerDiv.appendChild(stackDiv)

        const label = document.createElement("p")
        label.textContent = index + 1
        containerDiv.appendChild(label)

        board.appendChild(containerDiv)
    })

    document.getElementById("addBtn").disabled = stacks.every(
        (stack) => stack.length >= 5
    )
    document.getElementById("combineBtn").disabled = !stacks.some(
        (stack) => stack.length === 5 && new Set(stack).size === 1
    )
}

const addItems = () => {
    let items = []
    for (let i = 0; i < n - 1; i++) {
        items.push(colors[Math.floor(Math.random() * colors.length)])
    }

    let availableStacks = stacks.filter((stack) => stack.length < 5)
    if (availableStacks.length === 0) return

    items.forEach((color) => {
        let placed = false
        let attempts = 0
        while (!placed && attempts < 10) {
            let stackIndex = Math.floor(Math.random() * n)
            if (stacks[stackIndex].length < 5) {
                stacks[stackIndex].push(color)
                placed = true
            }
            attempts++
        }
    })
    renderStacks()
}

const selectStack = (index) => {
    if (selectedStack === null) {
        if (stacks[index].length > 0) {
            selectedStack = index
        }
    } else {
        moveItem(selectedStack, index)
        selectedStack = null
    }
    renderStacks()
}

const moveItem = (from, to) => {
    if (from === to || stacks[from].length === 0 || stacks[to].length >= 5)
        return

    let color = stacks[from][stacks[from].length - 1]
    if (stacks[to].length > 0 && stacks[to][stacks[to].length - 1] !== color)
        return

    let movableItems = []
    while (
        stacks[from].length > 0 &&
        stacks[from][stacks[from].length - 1] === color
    ) {
        movableItems.push(stacks[from].pop())
    }

    let spaceLeft = 5 - stacks[to].length
    while (movableItems.length > spaceLeft) {
        stacks[from].push(movableItems.pop())
    }

    while (movableItems.length > 0) {
        stacks[to].push(movableItems.pop())
    }

    renderStacks()
}

const combineItems = () => {
    stacks.forEach((stack, index) => {
        if (stack.length === 5 && new Set(stack).size === 1) {
            stacks[index] = []
            updateScore(10)
        }
    })
    renderStacks()
}

const sortStacks = () => {
    if (
        window.confirm(
            "스택을 정렬하시겠습니까?\n\n이 기능은 뒤주(Softlock) 발생 시 사용하는 기능으로, 스택이 꽉 차여있음에도 합성할 수 있는 스택이 없을 때 사용합니다.\n\n주의: 색상 별 5개를 넘어가면 제거됩니다.\n\n** 사용 시 점수 50이 차감됩니다. **"
        )
    ) {
        const colorOrder = colors

        stacks = colorOrder.map((color) =>
            stacks
                .flat()
                .filter((item) => item === color)
                .slice(0, 5)
        )

        updateScore(-50)

        renderStacks()
    }
}

const resetGame = () => {
    if (window.confirm("리셋하시겠습니까?")) {
        stacks = Array.from({ length: n }, () => [])
        score = 0
        updateScore()
        renderStacks()
    }
}

const handleCommand = (event) => {
    if (event.key === "Enter") {
        const command = event.target.value.trim()
        event.target.value = ""
        executeCommand(command)
    }
}

const executeCommand = (command) => {
    const parts = command.split(" ")
    const action = parts[0]

    if (action === "add" || action === "a") {
        addItems()
    } else if ((action === "move" || action === "m") && parts.length === 3) {
        const from = parseInt(parts[1]) - 1
        const to = parseInt(parts[2]) - 1
        if (!isNaN(from) && !isNaN(to)) {
            selectStack(from)
            selectStack(to)
        }
    } else if (action === "combine" || action === "c") {
        combineItems()
    } else if (action === "sort" || action === "s") {
        sortStacks()
    } else if (action === "reset" || action === "r") {
        resetGame()
    } else {
        alert("잘못된 명령어입니다")
    }
}

renderStacks()
