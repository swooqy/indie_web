package art.wikkd.chat.controller;


import org.slf4j.LoggerFactory;
import org.slf4j.Logger;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import art.wikkd.chat.dto.MessageDto;
import art.wikkd.chat.dto.MessageResponseDto;
import art.wikkd.chat.dto.WebSocketErrorDto;
import art.wikkd.chat.exception.ChatException;
import art.wikkd.chat.service.MessageService;

@Controller
public class ChatWebSocketController {

	private final Logger log = LoggerFactory.getLogger(ChatWebSocketController.class);

	private final MessageService messageService;
	private final SimpMessagingTemplate simpMessagingTemplate;

	public ChatWebSocketController(MessageService messageService, SimpMessagingTemplate simpMessagingTemplate) {
		this.messageService = messageService;
		this.simpMessagingTemplate = simpMessagingTemplate;
	}

	@MessageMapping("/topic/chat")
	public void sendMessage(MessageDto messageDto) {
		MessageResponseDto messageResponse = messageService.sendMessage(messageDto);
		log.debug("Sending message to /topic/chat/messages: {}", messageResponse);
		simpMessagingTemplate.convertAndSend("/topic/chat/messages", messageResponse);
	}

	@MessageExceptionHandler(ChatException.class)
	@SendToUser("/topic/user/errors")
	public WebSocketErrorDto handleChatError(ChatException chatException) {
		log.warn("Error sending message to /topic/chat/messages: {}", chatException.getMessage());
		return new WebSocketErrorDto(chatException.getMessage());
	}
}
