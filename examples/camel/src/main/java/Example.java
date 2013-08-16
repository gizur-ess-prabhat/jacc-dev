CamelContext context = new DefaultCamelContext();

/*
context.addRoutes(new RouteBuilder() {
    public void configure() {
        from("test-jms:queue:test.queue").to("file://test");
    }
});

ConnectionFactory connectionFactory = new ActiveMQConnectionFactory("vm://localhost?broker.persistent=false");
// Note we can explicit name the component
context.addComponent("test-jms", JmsComponent.jmsComponentAutoAcknowledge(connectionFactory));
*/

// Using ActiveMQ instead of JMS
context.addComponent("activemq", activeMQComponent("vm://localhost?broker.persistent=false"));

ProducerTemplate template = context.createProducerTemplate();

camelContext.start();

for (int i = 0; i < 10; i++) {
    template.sendBody("test-jms:queue:test.queue", "Test Message: " + i);
}
