package art.wikkd.chat.dto;

import java.time.OffsetDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponseDto {

	private Long id;
	private String content;
	private OffsetDateTime createdAt;
	private String userName;
	private Long userId;
	private String userColorHex;
}
