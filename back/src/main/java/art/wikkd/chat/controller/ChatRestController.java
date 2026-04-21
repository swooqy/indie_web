package art.wikkd.chat.controller;

import art.wikkd.chat.dto.MessageDto;
import art.wikkd.chat.dto.MessageResponseDto;
import art.wikkd.chat.service.MessageService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chat")
public class ChatRestController {

	private final MessageService messageService;

	public ChatRestController(MessageService messageService) {
		this.messageService = messageService;
	}

	@PostMapping("/send")
	public ResponseEntity<Void> sendMessage(@RequestBody MessageDto messageDto) {
		messageService.sendMessage(messageDto);
		return ResponseEntity.ok().build();
	}

	@GetMapping("/messages/{amount}")
	public ResponseEntity<List<MessageResponseDto>> getLatestMessages(@PathVariable("amount") int amount) {
		return ResponseEntity.ok(messageService.getLatestMessages(amount));
	}
}
