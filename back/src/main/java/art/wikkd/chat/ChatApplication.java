package art.wikkd.chat;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationEnvironmentPreparedEvent;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.util.StringUtils;

@SpringBootApplication
@EnableAsync
public class ChatApplication {

	public static void main(String[] args) {
		SpringApplication application = new SpringApplication(ChatApplication.class);
		application.addListeners(event -> {
			if (event instanceof ApplicationEnvironmentPreparedEvent environmentPreparedEvent) {
				configurePostgresTrustStore(environmentPreparedEvent);
			}
		});
		application.run(args);
	}

	private static void configurePostgresTrustStore(ApplicationEnvironmentPreparedEvent event) {
		if (!event.getEnvironment().getProperty("app.datasource.ssl.enabled", Boolean.class, false)) {
			return;
		}

		setSslProperty(event, "app.datasource.ssl.trust-store", "javax.net.ssl.trustStore");
		setSslProperty(event, "app.datasource.ssl.trust-store-password", "javax.net.ssl.trustStorePassword");
		setSslProperty(event, "app.datasource.ssl.trust-store-type", "javax.net.ssl.trustStoreType");
	}

	private static void setSslProperty(ApplicationEnvironmentPreparedEvent event, String applicationProperty,
			String systemProperty) {
		String value = event.getEnvironment().getProperty(applicationProperty);
		if (StringUtils.hasText(value)) {
			System.setProperty(systemProperty, value);
		}
	}

}
