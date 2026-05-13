package art.wikkd.chat.controller;

import art.wikkd.chat.dto.MessageResponseDto;
import art.wikkd.chat.service.MessageService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chat")
public class ChatRestController {

	private final MessageService messageService;

	public ChatRestController(MessageService messageService) {
		this.messageService = messageService;
	}

	@GetMapping("/messages")
	public ResponseEntity<List<MessageResponseDto>> getMessages(
			@RequestParam(name = "limit", defaultValue = "10") int limit,
			@RequestParam(name = "beforeId", required = false) Long beforeId) {
		return ResponseEntity.ok(messageService.getMessagesBefore(beforeId, limit));
	}
	
}
