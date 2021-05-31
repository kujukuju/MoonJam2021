class LogicLoop {
    static update(time, dt) {
        // const dt = MusicManager.getCurrentDT(time);
        // console.log(dt, dt);

        EntityInformation.update(time, dt);
        AbilityInformation.update(time, dt);
        LevelManager.update(time, dt);
        StateManager.update(time, dt);

        // updates last so we can get music delta time
        MusicManager.update(time, dt);
        NoteBar.update(time, dt);

        Camera.update(time, dt);
        BoundaryRenderer.update(time,dt);
        GroundRenderer.update(time, dt);

        GateManager.update(time, dt);
        ChargeManager.update(time, dt);
        EnemyArrowManager.update(time, dt);
        ParallaxManager.update(time, dt);
        CoolMenuOverlayManager.update(time, dt);
    }
}