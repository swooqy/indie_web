package art.wikkd.chat.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

	private final String[] allowedOriginPatterns;

	public CorsConfig(@Value("${app.cors.allowed-origins:http://localhost:5173}") String[] allowedOriginPatterns) {
		this.allowedOriginPatterns = allowedOriginPatterns;
	}

	@Override
	public void addCorsMappings(CorsRegistry registry) {
		registry.addMapping("/api/**")
				.allowedOriginPatterns(allowedOriginPatterns)
				.allowedMethods("GET", "POST", "OPTIONS")
				.allowedHeaders("*")
				.allowCredentials(true);
	}
}
