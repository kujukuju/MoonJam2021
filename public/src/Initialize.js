window.onload = () => {
    Renderer.initialize();
    InputManager.initialize();
    LevelManager.initialize();
    MusicManager.initialize();
    StateManager.initialize();
    BoundaryRenderer.initialize();
    NoteBar.initialize();
    Camera.initialize();
    GateManager.initialize();
    GroundRenderer.initialize();
    AudioStuff.initialize();
    ChargeManager.initialize();
    EnemyArrowManager.initialize();
    ParallaxManager.initialize();
    CoolMenuOverlayManager.initialize();

    Loop.initialize();

    setTimeout(() => {
        document.getElementById('loading').style.display = 'none';
    }, 3000);
};
