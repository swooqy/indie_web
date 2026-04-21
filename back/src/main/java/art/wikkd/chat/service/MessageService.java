package art.wikkd.chat.service;

import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import art.wikkd.chat.dto.MessageDto;
import art.wikkd.chat.dto.MessageResponseDto;
import art.wikkd.chat.dto.SenderSummaryDto;
import art.wikkd.chat.entity.Message;
import art.wikkd.chat.entity.User;
import art.wikkd.chat.repository.MessageRepository;

@Service
public class MessageService {

	private final MessageRepository messageRepository;
	private final UserService userService;

	public MessageService(MessageRepository messageRepository, UserService userService) {
		this.messageRepository = messageRepository;
		this.userService = userService;
	}

    public void sendMessage(MessageDto messageDto) {
        User user = userService.getUserByUuid(messageDto.getUuid());

        if(user.getUsername() != messageDto.getUsername()) {
            userService.updateUserName(messageDto.getUsername(), messageDto.getUuid());
        }

        Message message = new Message();
        message.setContent(messageDto.getMessage());
        message.setSender(user);
        messageRepository.save(message);
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
}
