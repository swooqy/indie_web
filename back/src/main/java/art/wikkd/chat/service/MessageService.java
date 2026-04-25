package art.wikkd.chat.service;

import java.time.OffsetDateTime;
import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import art.wikkd.chat.dto.MessageDto;
import art.wikkd.chat.dto.MessageResponseDto;
import art.wikkd.chat.dto.SenderSummaryDto;
import art.wikkd.chat.entity.Message;
import art.wikkd.chat.entity.User;
import art.wikkd.chat.exception.ChatException;
import art.wikkd.chat.repository.MessageRepository;

@Service
public class MessageService {

	private final MessageRepository messageRepository;
	private final UserService userService;
	private final AsyncMessagePersistenceService asyncMessagePersistenceService;

	public MessageService(MessageRepository messageRepository, UserService userService,
			AsyncMessagePersistenceService asyncMessagePersistenceService) {
		this.messageRepository = messageRepository;
		this.userService = userService;
		this.asyncMessagePersistenceService = asyncMessagePersistenceService;
	}

	public MessageResponseDto sendMessage(MessageDto messageDto) {
		
		if (messageDto.getUuid() == null) {
			throw new ChatException("UUID is required");
		}
		
		String messageContent = normalizeText(messageDto.getMessage());
		if (messageContent == null) {
			throw new ChatException("Message cannot be empty");
		}

		User user = userService.getUserByUuid(messageDto.getUuid());
		String nextUsername = normalizeText(messageDto.getUsername());
		if (nextUsername != null && !nextUsername.equals(user.getUsername())) {
			userService.updateUserName(nextUsername, messageDto.getUuid());
			user.setUsername(nextUsername);
		}

		MessageResponseDto response = MessageResponseDto.builder()
				.content(messageContent)
				.createdAt(OffsetDateTime.now())
				.sender(new SenderSummaryDto(user))
				.build();

		asyncMessagePersistenceService.persistMessage(user.getId(), messageContent);
		return response;
	}

	public List<MessageResponseDto> getLatestMessages(int amount) {
		return messageRepository.findAllByOrderByIdDesc(PageRequest.of(0, amount)).stream()
				.map(this::toResponseDto)
				.toList();
	}

	private MessageResponseDto toResponseDto(Message message) {
		User sender = message.getSender();
		return MessageResponseDto.builder()
				.id(message.getId())
				.content(message.getContent())
				.createdAt(message.getCreatedAt())
				.sender(new SenderSummaryDto(sender))
				.build();
	}

	private String normalizeText(String input) {
		if (input == null) {
			return null;
		}
		String trimmed = input.trim();
		return trimmed.isEmpty() ? null : trimmed;
	}
}
