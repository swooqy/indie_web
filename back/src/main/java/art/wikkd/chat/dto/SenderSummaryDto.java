package art.wikkd.chat.dto;

import art.wikkd.chat.entity.User;
import lombok.Data;

@Data
public class SenderSummaryDto {

	public SenderSummaryDto(User user) {
		this.id = user.getId();
		this.username = user.getUsername();
	}

	private Long id;
	private String username;
}
