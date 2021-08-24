 function handleKeyPressed(e) {
    const key = e.key
    
    const validKey = moveSnake(key)

    if (validKey !== false) automaticMoveDirection = validKey
    
}