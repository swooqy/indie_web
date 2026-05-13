package art.wikkd.chat.service;

import java.time.OffsetDateTime;
import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import art.wikkd.chat.dto.MessageDto;
import art.wikkd.chat.dto.MessageResponseDto;
import art.wikkd.chat.entity.Message;
import art.wikkd.chat.entity.User;
import art.wikkd.chat.exception.ChatException;
import art.wikkd.chat.repository.MessageRepository;

@Service
public class MessageService {

	private static final int DEFAULT_MESSAGE_LIMIT = 10;
	private static final int MAX_MESSAGE_LIMIT = 100;

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
				.userColorHex(user.getColorHex())
				.userName(user.getUsername())
				.userId(user.getId())
				.build();

		asyncMessagePersistenceService.persistMessage(user.getId(), messageContent);
		return response;
	}

	public List<MessageResponseDto> getLatestMessages(int amount) {
		return messageRepository.findAllByOrderByIdDesc(PageRequest.of(0, normalizeLimit(amount))).stream()
				.map(this::toResponseDto)
				.toList();
	}

	public List<MessageResponseDto> getMessagesBefore(Long beforeId, int amount) {
		if (beforeId == null || beforeId <= 0) {
			return getLatestMessages(amount);
		}

		return messageRepository.findByIdLessThanOrderByIdDesc(beforeId, PageRequest.of(0, normalizeLimit(amount))).stream()
				.map(this::toResponseDto)
				.toList();
	}

	private MessageResponseDto toResponseDto(Message message) {
		User user = message.getSender();
		return MessageResponseDto.builder()
				.id(message.getId())
				.content(message.getContent())
				.createdAt(message.getCreatedAt())
				.userColorHex(user.getColorHex())
				.userName(user.getUsername())
				.userId(user.getId())
				.build();
	}

	private String normalizeText(String input) {
		if (input == null) {
			return null;
		}
		String trimmed = input.trim();
		return trimmed.isEmpty() ? null : trimmed;
	}

	private int normalizeLimit(int amount) {
		if (amount <= 0) {
			return DEFAULT_MESSAGE_LIMIT;
		}
		return Math.min(amount, MAX_MESSAGE_LIMIT);
	}
}
