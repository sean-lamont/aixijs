class Test {
    static config() {
        return {
            map :   [["F","W"],
                    ["F","F"],
                    ["W","F"]],
            initial_pos : {
                x: 1,
                y: 1
            },
            freqs : [1]
        }
    }
}

QUnit.test("Dispenser",function(assert) {
    var t = new Dispenser(0,0,1)
    assert.notOk(t.chocolate)
    for (var i=0; i<100;i++) {
        assert.equal(t.reward(),r_empty)
        t.dispense()
        assert.ok(t.chocolate)
        assert.equal(t.reward(),r_chocolate)
        assert.notOk(t.chocolate)
    }
})

QUnit.test("Grid",function(assert) {
    var g = new Grid(Test.config())
    g.add_dispenser(0,0,0.3)
    assert.equal(g.get_dispenser().chocolate,false)
    assert.equal(g.get_dispenser().freq,0.3)
    g.remove_dispenser(0,0)
    assert.equal(g.get_tile(0,0).reward(),r_empty)

})

QUnit.test("SimpleDispenserGrid",function(assert) {
    var e = new SimpleDispenserGrid(Test.config())

    // dispenser stuff
    e.grid.add_dispenser(2,1,1)
    assert.equal(e.grid.disp[0][0],2)
    assert.equal(e.grid.disp.length,1)

    // rewards and dynamics
    e.pos = {x:1,y:1}
    var percept = e.perform(0) // up
    assert.equal(percept.rew,r_wall)
    percept = e.perform(1) // down
    assert.equal(percept.rew,r_chocolate)
    percept = e.perform(4) // noop
    assert.equal(percept.rew,r_chocolate)
    percept = e.perform(1) // down
    assert.equal(percept.rew,r_wall)
    percept = e.perform(4) // noop
    assert.equal(percept.rew,r_chocolate)
    percept = e.perform(2)
    assert.equal(percept.rew,r_wall)
    percept = e.perform(4) // noop
    assert.equal(percept.rew,r_chocolate)

    // save and load
    e.save()
    percept = e.perform(0)
    assert.equal(percept.rew,r_empty)
    percept = e.perform(4)
    assert.equal(percept.rew,r_empty)
    e.load()
    percept = e.perform(4)
    assert.equal(percept.rew,r_chocolate)
    assert.equal(e.pos.x,2)
})

QUnit.test("Nu",function(assert) {
    var cfg = Test.config()
    cfg.dispenser_pos = {x:2,y:1}
    var env = new SimpleDispenserGrid(cfg)
    var actions = [0,1,2,3,4]
    for (var i=0; i<1e3; i++) {
        var a = Util.random_choice(actions)
        var or = env.perform(a)
        var n = env.nu(or.obs,or.rew)
        assert.notEqual(n,0)
    }
})

QUnit.test("BayesMixture",function(assert) {
    var M = make_M(SimpleDispenserGrid,Test.config())
    assert.equal(M.length,6)
    var truth = 5
    var model = new BayesMixture(M,"Mu",5)

    var cfg = Test.config()
    cfg.dispenser_pos = {x:2,y:1}
    var env = new SimpleDispenserGrid(cfg)

    var actions = [0,1,2,3,4]
    for (var i=0;i<1e3;i++) {
        var a = Util.random_choice(actions)
        var or = env.perform(a)
        try {
            model.update(a,or.obs,or.rew)
        } catch(e) {
            console.error(e)
            assert.deepEqual(env.pos,model.model_class[truth].pos)
            assert.ok(false)
            break
        }

    }
})
