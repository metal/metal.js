'use strict';

var FakeTransport = window.FakeTransport;

describe('Transport', function() {
  it('should set uri from constructor', function() {
    var transport = new lfr.Transport('http://liferay.com');
    assert.strictEqual('http://liferay.com', transport.getUri(), 'Should set uri from constructor');
  });

  it('should default state be empty', function() {
    var transport = new lfr.Transport('');
    assert.strictEqual('', transport.getState());
  });

  it('should throw error when a message is sent before open', function() {
    var transport = new lfr.Transport('');
    assert.throws(function() {
      transport.send(null);
    }, Error);
  });

  it('should throw error when a message is sent from abstract transport', function() {
    var transport = new lfr.Transport('');
    transport.setState('open');
    assert.throws(function() {
      transport.send(null);
    }, Error);
  });

  it('should call subclass write method on send', function() {
    var transport = new FakeTransport('');
    sinon.stub(transport, 'write');

    transport.open();
    transport.send('message');
    assert.strictEqual('message', transport.write.args[0][0]);
  });

  it('should throw error when uri is not specified', function() {
    assert.throws(function() {
      new lfr.Transport();
    }, Error);

    assert.doesNotThrow(function() {
      new lfr.Transport('');
    });
  });

  it('should change state when open/close event is emitted', function() {
    var transport = new lfr.Transport('');
    assert.strictEqual('', transport.getState());

    transport.emit('open');
    assert.strictEqual('open', transport.getState());

    transport.emit('close');
    assert.strictEqual('closed', transport.getState());
  });

  it('should set initial default config', function() {
    var transport = new lfr.Transport('');
    assert.strictEqual(lfr.Transport.INITIAL_DEFAULT_CONFIG, transport.getDefaultConfig());
  });

  it('should set initial default config for subclass', function() {
    var TestTransport = function(uri) {
      TestTransport.base(this, 'constructor', uri);
    };
    lfr.inherits(TestTransport, lfr.Transport);
    TestTransport.INITIAL_DEFAULT_CONFIG = {
      config1: 1,
      config2: 'two'
    };

    var transport = new TestTransport('');
    assert.strictEqual(TestTransport.INITIAL_DEFAULT_CONFIG, transport.getDefaultConfig());
  });

  it('should use first defined initial default config for subclass', function() {
    var TestTransport = function(uri) {
      TestTransport.base(this, 'constructor', uri);
    };
    lfr.inherits(TestTransport, lfr.Transport);
    TestTransport.INITIAL_DEFAULT_CONFIG = {
      config1: 1,
      config2: 'two'
    };

    var TestChildTransport = function(uri) {
      TestChildTransport.base(this, 'constructor', uri);
    };
    lfr.inherits(TestChildTransport, TestTransport);

    var transport = new TestChildTransport('');
    assert.strictEqual(TestTransport.INITIAL_DEFAULT_CONFIG, transport.getDefaultConfig());
  });

  it('should set default config', function() {
    var transport = new lfr.Transport('');
    var defaultConfig = {
      config1: 1,
      config2: 'two'
    };
    transport.setDefaultConfig(defaultConfig);
    assert.strictEqual(defaultConfig, transport.getDefaultConfig());
  });

  it('should send config filled with default options', function() {
    var transport = new FakeTransport('');
    sinon.stub(transport, 'write');

    transport.setDefaultConfig({
      config1: 1,
      config2: {
        number: 2,
        string: 'two'
      },
      config3: 3
    });
    transport.open();
    transport.send('message', {
      config2: {
        binary: '10'
      },
      config3: -3,
      config4: 4
    });

    var config = transport.write.args[0][1];
    assert.strictEqual(1, config.config1);
    assert.strictEqual('10', config.config2.binary);
    assert.strictEqual(undefined, config.config2.number);
    assert.strictEqual(undefined, config.config2.string);
    assert.strictEqual(-3, config.config3);
    assert.strictEqual(4, config.config4);
  });

  it('should close when disposed', function() {
    var transport = new FakeTransport('');
    sinon.stub(transport, 'close');

    transport.dispose();
    assert.strictEqual(1, transport.close.callCount);
  });

  it('should be able to open after disposed', function() {
    var transport = new FakeTransport('');
    sinon.stub(transport, 'close');

    transport.dispose();
    transport.emit('close');
    assert.throws(function() {
      transport.open();
    });
  });
});
