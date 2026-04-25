package art.wikkd.chat.service;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import art.wikkd.chat.entity.Message;
import art.wikkd.chat.entity.User;
import art.wikkd.chat.repository.MessageRepository;

@Service
public class AsyncMessagePersistenceService {

	private final MessageRepository messageRepository;
	private final UserService userService;

	public AsyncMessagePersistenceService(MessageRepository messageRepository, UserService userService) {
		this.messageRepository = messageRepository;
		this.userService = userService;
	}

	@Async
	public void persistMessage(Long userId, String content) {
		User user = userService.getUserById(userId);
		Message message = new Message();
		message.setContent(content);
		message.setSender(user);
		messageRepository.save(message);
	}
}
